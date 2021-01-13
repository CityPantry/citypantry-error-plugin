import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as uuid from 'uuid/v4';
import { config } from '../../config';
import { Report, toHumanString } from '@models';
import { awsApi } from '../api/aws.api';
import { Bug, jiraApi } from '../api/jira.api';
import { slackApi } from '../api/slack.api';

export const main: APIGatewayProxyHandler = async (event) => {
  const response = await report(event, undefined, undefined);
  if (response) {
    if (!response.headers) {
      response.headers = {};
    }
    response.headers['Access-Control-Allow-Origin'] = '*';
  }
  return response as APIGatewayProxyResult;
}

const report: APIGatewayProxyHandler = async (event) => {
  // Shouldn't need to JSON parse this but we can fix later
  const body: Report = (() => {
    if (typeof event.body === 'object') {
      return event.body;
    } else {
      try {
        return JSON.parse(event.body);
      } catch (e) {
        console.log('Failed to JSON parse:', body);
        throw e;
      }
    }
  })();

  const parsedReport = body as Report & { impact: string };
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

  const reportUuid = uuid(); // used in filenames so that they are not guessable by the public
  const imageName = `screenshot-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}-${reportUuid}.png`;
  const errorFileName = `console-errors-${report.name.replace(/\W/gi, '').toLowerCase()}-${report.time}-${reportUuid}.json`;
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
    incidentSize: report.incidentSize,
    summary: report.summary,
    description: createJiraDescription(report, imageUrl, dataUrl)
  };

  try {
    const issueKey = await jiraApi.createIssue(bug);
    const attachments = createSlackAttachments(report, imageUrl, issueKey);
    await slackApi.post({ text: `New Bug Reported:`, attachments });
  } catch (error) {
    console.log('Upstream error', error);
    return {
      statusCode: 503,
      body: JSON.stringify(error.body),
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

function createSlackAttachments(report: Report, imageUrl: string | null, issueKey: string): any[] {
  const attachments: any[] = [{
    'fallback': `Bug report ${issueKey} reported by ${report.name} for ${report.time} at ${report.url}`,
    'title': `${issueKey}: ${report.summary}`,
    'title_link': `${config.jiraServer}/browse/${issueKey}`,
    'text': `*Reporter:* ${report.name}
*Incident Size*: ${toHumanString(report.incidentSize)}

*What's Wrong?*
${report.description}

*Time:* ${report.time}
*Affected People:* ${report.affectedPeople}

*Steps to Reproduce*:
_${report.isMasquerading ? 'Masquerading' : 'Logged in'} as ${report.currentUser}_
${report.url}

${report.stepsToReproduce}

*Issue URL*
${config.jiraServer}/browse/${issueKey}`,
    'color': '#FF8000'
  }];
  if (imageUrl) {
    attachments.push({
      'fallback': `Screenshot uploaded by ${report.name} for ${report.time} at ${imageUrl}`,
      'title': `Screenshot of ${issueKey}`,
      'title_link': imageUrl,
      'image_url': imageUrl,
      'color': '#FF8000'
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

*Number of Affected People:*
${toHumanString(report.incidentSize)}

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
