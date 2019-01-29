import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';
import { Report, Urgency } from '../../models';
import { awsApi } from '../api/aws.api';
import { Bug, jiraApi } from '../api/jira.api';
import { config } from '../../config';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {
  // Shouldn't need to JSON parse this but we can fix later
  const parsedReport = JSON.parse(request.body) as Report & { impact: string }; // TODO: Remove impact after 06/02/2019
  const report = {
    ...parsedReport,
    name: trim(parsedReport.name),
    summary: trim(parsedReport.impact || parsedReport.summary),
    description: trim(parsedReport.description),
    affectedPeople: trim(parsedReport.affectedPeople),
    stepsToReproduce: trim(parsedReport.stepsToReproduce),
    currentUser: trim(parsedReport.currentUser)
  } as Report;

  // SLACK
  const screenshot = report.screenshot ? new Buffer(report.screenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64') : null;

  const imageName = `screenshot-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}.png`;
  const errorFileName = `console-errors-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}.json`;
  let dataUrl: string | null = null;
  if (report.consoleErrors && report.consoleErrors.length > 1000) {
    console.log(`consoleErrors is too long (${report.consoleErrors.length}, uploading`);
    dataUrl = await awsApi.uploadText(report.consoleErrors, errorFileName);
    console.log(`Uploaded consoleErrors to ${dataUrl}`);
  }

  const imageUrl = screenshot ? await awsApi.uploadImage(screenshot, imageName) : null;
  if (imageUrl) {
    console.log(`Uploaded image to ${imageUrl}`);
  }

  // JIRA
  const bug: Bug = {
    urgency: report.urgency,
    summary: report.summary,
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

function trim(text: string): string {
  return (text || '').trim();
}

function getUrgencyIcon(urgency: Urgency): string {
  switch (urgency) {
    case Urgency.IMMEDIATE: return ' :fire:';
    case Urgency.HIGH: return ' :exclamation:';
    default: return '';
  }
}

function createSlackAttachments(report: Report, imageUrl: string | null, issueKey: string): any[] {
  const attachments: any[] = [{
    'fallback': `Bug report ${issueKey} reported by ${report.name} for ${report.time} at ${report.url}`,
    'title': `${issueKey}: ${report.summary}`,
    'title_link': `${config.jiraServer}/browse/${issueKey}`,
    'text': `*Reporter:* ${report.name}
*Urgency*: ${report.urgency}${getUrgencyIcon(report.urgency)}

*What's Wrong?*
${report.description}

*Time:* ${report.time}
*Affected People:* ${report.affectedPeople}

*Steps to Reproduce*:
_${report.isMasquerading ? 'Logged in' : 'Masquerading'} as ${report.currentUser}_
${report.url}

${report.stepsToReproduce}

*Issue URL*
${config.jiraServer}/browse/${issueKey}`,
    'color': '#FFF200'
  }];
  if (imageUrl) {
    attachments.push({
      'fallback': `Screenshot uploaded by ${report.name} for ${report.time} at ${imageUrl}`,
      'title': `Screenshot of ${issueKey}`,
      'title_link': imageUrl,
      'image_url': imageUrl,
      'color': '#FFF200'
    })
  }
  return attachments;
}

function createJiraDescription(report: Report, screenshotUrl: string | null, dataUrl: string | null): string {
  return `*Reported By:* ${report.name}

*URL:* ${report.url}
*Time:* ${report.time}

*What's Wrong:*
${report.summary}

*Details:*
${report.description}

*Affected People:*
${report.affectedPeople}

*Current User:*
${report.isMasquerading ? 'Masquerading as ' : ''}${report.currentUser}

*Steps to Reproduce:*
${report.stepsToReproduce}

*Screenshot:*
${screenshotUrl || 'No Screenshot'}

*Console data:*
${dataUrl ? dataUrl : Buffer.from(report.consoleErrors || '').toString('base64')}
`;
}
