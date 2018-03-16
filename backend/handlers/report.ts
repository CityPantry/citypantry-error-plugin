import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';
import { Report } from '../../models';
import { awsApi } from '../api/aws.api';
import { BugReport } from '../../models/jira';
import { jiraApi } from '../api/jira.api';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {
  // Shouldn't need to JSON parse this but we can fix later
  const params = JSON.parse(request.body) as Report;

  // SLACK
  // const screenshot = new Buffer(params.screenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  //
  // const filename = `screenshot-${params.name.replace(/\W/gi, '').toLowerCase()}-${params.time}.png`;
  // const imageUrl = await awsApi.uploadImage(screenshot, filename);
  //
  // console.log('UPLOADED');
  //
  // const formattedReport = formatSlackBody(params);


  // JIRA
  const bug: any = {
    fields: {
      // project: {key: 'TEST'},
      issuetype: {
        name: 'Bug',
      },
      // priority: {
      //   name: 'Low'
      // },
      summary: 'test summary',
      description: 'test description',
    }
  };


  try {
    await jiraApi.createIssue(bug);
  } catch (error) {
    console.log("error reporting to JIRA", error);
    return {
      statusCode: 503,
      body: error.body,
    }
  }

  // try {
  //   const attachment = createSlackAttachment(params, imageUrl);
  //
  //   await slackApi
  //     .post(formattedReport, undefined, [attachment]);
  // } catch (error) {
  //   console.log(error);
  //
  //   return {
  //     statusCode: 503,
  //     body: `Error reporting to Slack ${error.toString()}`,
  //   }
  // }

  return {
    statusCode: 200,
    body: '"Invoked successfully!"',
  };
}

function formatSlackBody(params: Report): string {
  return `Name: ${params.name}
Description: ${params.description}
Urgency: ${params.urgency}
Impact: ${params.impact}
Affected People: ${params.affectedPeople}
URL: ${params.url}
Time: ${params.time}
Current user: ${params.currentUser}
Are you masquerading?: ${params.isMasquerading}
Steps to reproduce:\n ${params.stepsToReproduce}`;
}

function createSlackAttachment(params: any, imageUrl: string): any {
  return {
    'fallback': `Screenshot uploaded by ${params.name} for ${params.time} at ${imageUrl}`,
    'title': 'Bug Screenshot',
    'title_link': imageUrl,
    'text': params.description,
    'image_url': imageUrl,
    'color': '#FFF200'
  };
}
