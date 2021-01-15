import { IncidentSize, Report, toHumanString } from '@models';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';
import * as uuid from 'uuid/v4';
import { config } from '../../config';
import { awsApi } from '../api/aws.api';
import { BlockData, BlocksPostData, slackApi } from '../api/slack.api';
import { image } from './image';

export const main: APIGatewayProxyHandler = async () => {
  const response = await report(undefined, undefined, undefined);
  if (response) {
    if (!response.headers) {
      response.headers = {};
    }
    response.headers['Access-Control-Allow-Origin'] = '*';
  }
  return response as APIGatewayProxyResult;
}

const report: APIGatewayProxyHandler = async () => {

  const report: Report = {
    name: 'Reporter Name',
    email: '',
    summary: 'Bacon ipsum dolor amet spare ribs prosciutto biltong, chuck tenderloin frankfurter ribeye sausage drumstick cow.',
    description: 'Bacon ipsum dolor amet spare ribs prosciutto biltong,\nchuck tenderloin frankfurter ribeye sausage drumstick cow.\nTenderloin chislic strip steak pastrami, corned beef frankfurter pork belly turkey biltong.\nHamburger ham spare ribs prosciutto sausage, capicola rump cupim pork tenderloin ribeye andouille venison landjaeger.\n\nTurducken biltong chuck pork, chicken short loin ribeye jerky jowl tongue cow.',
    screenshot: null,
    url: 'https://google.com',
    isMasquerading: true,
    stepsToReproduce: '1. Do thing\n2. Do another thing\n3. Don\'t do the next thing',
    incidentSize: IncidentSize.MEDIUM,
    consoleErrors: '',
    currentUser: 'Current User',
    affectedPeople: 'Just Me',
    time: new Date().toISOString(),
  };

  const screenshot = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  const reportUuid = uuid(); // used in filenames so that they are not guessable by the public
  const imageName = `screenshot-${report.name.replace(/\W/gi, '').toLowerCase()}-TEST-${reportUuid}.png`;
  const slackId = '';

  try {
    const issueKey = 'CPD-00000'
    const { post: slackPost, threadReply } = createSlackBody(report, slackId, issueKey);
    console.log('Posting', slackPost);
    const { permalink: slackUrl, ts: slackTs, channel: slackChannel } = await retry(() => slackApi.post({ ...slackPost, channel: '#slack-test' }))
    console.log('Updating:', {
      channel: slackChannel,
      thread_ts: slackTs,
      blocks: threadReply
    });
    await slackApi.uploadImage(slackChannel, slackTs, imageName, screenshot);
    await slackApi.post({ // Thread reply
      channel: slackChannel,
      threadTs: slackTs,
      blocks: threadReply
    });

    console.log('Slack URL', slackUrl);

  } catch (error) {
    console.log('Upstream error', error);
    return {
      statusCode: 503,
      body: JSON.stringify(error.message),
    }
  }

  return {
    statusCode: 200,
    body: '"Invoked successfully!"',
  };
}

function createSlackBody(report: Report, slackId: string | null, issueKey: string): { post: BlocksPostData, threadReply: BlockData[] } {
  const jiraLink = `${config.jiraServer}/browse/${issueKey}`;
  return {
    post: {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'New bug reported:'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${jiraLink}|${issueKey}: ${report.summary}>*`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*URL:* <${report.url}|https://citypantry.com/foo/bar?baasdaasda>`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*What's Wrong?*\n${report.description}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Incident Size:* ${toHumanString(report.incidentSize)}\n*Reporter:* ${report.name}${slackId ? `(<@${slackId}>)` : ''}`
          }
        },
      ]
    },
    threadReply: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Affected People:* ${report.affectedPeople}
*Time:* ${report.time}

*Steps to Reproduce*:
_${report.isMasquerading ? 'Masquerading' : 'Logged in'} as ${report.currentUser}_
<${report.url}|${report.url}>

${report.stepsToReproduce}`
        }
      }
    ],
  };

/*
  const attachments: any[] = [{
    'fallback': `Bug report ${issueKey} reported by ${report.name} for ${report.time} at ${report.url}`,
    'title': `${issueKey}: ${report.summary}`,
    'title_link': `${config.jiraServer}/browse/${issueKey}`,
    'text': `*Reporter:* ${report.name}${slackId ? ` (<@${slackId}>)` : ''}
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
 */
}

function retry<T>(callback: () => Promise<T>, retryDelayMs: number = 100, maxTimeoutMs: number = 5000): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    let isResolved = false;
    setTimeout(() => {
      if (isResolved) {
        return;
      }
      console.log('Aborting waiting');
      isResolved = true;
      reject(new Error(`Timed out after ${maxTimeoutMs}ms.`));
    }, maxTimeoutMs);

    while (!isResolved) {
      console.log('Trying');
      try {
        const response = await callback();
        if (isResolved) {
          return;
        }

        isResolved = true;
        resolve(response);
      } catch (e) {
        console.log(`Failed, delaying retry by ${retryDelayMs}ms...`, e);

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  });
}

// function waitUntilImageIsAvailable(imageUrl: string): Promise<boolean> {
//   return new Promise<boolean>(async (resolve) => {
//     let isResolved = false;
//     setTimeout(() => {
//       if (isResolved) {
//         return;
//       }
//       console.log('Aborting waiting');
//       isResolved = true;
//       resolve(false);
//     }, 5000);
//
//     while (!isResolved) {
//       console.log('Trying', imageUrl);
//       const response = await axios.head(imageUrl);
//       if (isResolved) {
//         return;
//       }
//       console.log('Response is', response.status);
//       if (response.status >= 200 && response.status < 300) {
//         isResolved = true;
//         resolve(true);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
//   });
// }
