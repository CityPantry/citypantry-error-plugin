import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';
import { Report } from '../../models';
import { awsApi } from '../api/aws.api';
import { Bug, jiraApi } from '../api/jira.api';
import { config } from '../../config';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {
  // Shouldn't need to JSON parse this but we can fix later
  const report = JSON.parse(request.body) as Report;

  // SLACK
  const screenshot = new Buffer(report.screenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const imageName = `screenshot-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}.png`;
  const errorFileName = `console-errors-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}.json`;
  let dataUrl: string | null = null;
  if (report.consoleErrors && report.consoleErrors.length > 1000) {
    console.log(`consoleErrors is too long (${report.consoleErrors.length}, uploading`);
    dataUrl = await awsApi.uploadText(report.consoleErrors, errorFileName);
    console.log(`Uploaded consoleErrors to ${dataUrl}`);
  }

  const imageUrl = await awsApi.uploadImage(screenshot, imageName);
  console.log(`Uploaded image to ${imageUrl}`);

  // JIRA
  const bug: Bug = {
    urgency: report.urgency,
    summary: report.impact,
    description: createJiraDescription(report, imageUrl, dataUrl)
  };

  try {
    const issueKey = await jiraApi.createIssue(bug);
    const attachments = createSlackAttachments(report, imageUrl, issueKey);
    await slackApi.post(`New Bug Reported:`, undefined, attachments);
  } catch (error) {
    console.log('Upstream error', error);
    return {
      statusCode: 503,
      body: error.body,
    }
  }

  return {
    statusCode: 200,
    body: '"Invoked successfully!"',
  };
}

function createSlackAttachments(report: Report, imageUrl: string, issueKey: string): any[] {
  return [{
    'fallback': `Bug report ${issueKey} reported by ${report.name} for ${report.time} at ${report.url}`,
    'title': `${issueKey}: ${report.impact}`,
    'title_link': `${config.jiraServer}/browse/${issueKey}`,
    'text': `*Reporter:* ${report.name}

*What's Wrong?*
${report.description}

*Time:* ${report.time}
*Affected People:* ${report.affectedPeople}
*Urgency*: ${report.urgency}

*Steps to Reproduce*:
_${report.isMasquerading ? 'Logged in' : 'Masquerading'} as ${report.currentUser}_
${report.url}

${report.stepsToReproduce}

*Issue URL*
${config.jiraServer}/browse/${issueKey}`,
    'color': '#FFF200'
  },{
    'fallback': `Screenshot uploaded by ${report.name} for ${report.time} at ${imageUrl}`,
    'title': `Screenshot of ${issueKey}`,
    'title_link': imageUrl,
    'image_url': imageUrl,
    'color': '#FFF200'
  }];
}

function createJiraDescription(report: Report, screenshotUrl: string, dataUrl: string | null): string {
  return `*Reported By:* ${report.name}

*URL:* ${report.url}
*Time:* ${report.time}

*What's Wrong:*
${report.description}

*Impact:*
${report.impact}

*Affected People:*
${report.affectedPeople}

*Current User:*
${report.isMasquerading ? 'Masquerading as ' : ''}${report.currentUser}

*Steps to Reproduce:*
${report.stepsToReproduce}

*Screenshot:*
${screenshotUrl}

*Console data:*
${dataUrl ? dataUrl : Buffer.from(report.consoleErrors || '').toString('base64')}
`;
}
