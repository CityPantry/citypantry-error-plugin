import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';
import { Report } from '../../models';
import { config } from '../config';
import { awsApi } from '../api/aws.api';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {
  console.log('request');
  console.log(request);

  // Shouldn't need to JSON parse this but we can fix later
  const params = JSON.parse(request.body) as Report;

  console.log('body');
  // console.log(params);

  const screenshot = new Buffer(params.screenshot.replace(/^data:image\/\w+;base64,/, ""),'base64');

  const filename = `screenshot-${params.name.replace(/\W/gi, '').toLowerCase()}-${params.time}.png`;
  const imageUrl = await awsApi.uploadImage(screenshot, filename);

  console.log('UPLOADED');

  const formattedReport =
`Name: ${params.name}
Description: ${params.description}
Urgency: ${params.urgency}
Impact: ${params.impact}
Affected People: ${params.affectedPeople}
URL: ${params.url}
Time: ${params.time}
Current user: ${params.currentUser}
Are you masquerading?: ${params.isMasquerading}
Steps to reproduce:\n ${params.stepsToReproduce}`;

  try {
    const attachment = {
      "fallback": `Screenshot uploaded by ${params.name} for ${params.time} at ${imageUrl}`,
      "title": 'Bug Screenshot',
      "title_link": imageUrl,
      "text": params.description,
      "image_url": imageUrl,
      "color": "#FFF200"
    };

    await slackApi
      .post(formattedReport, undefined, [attachment]);
  } catch (error) {
    console.log(error);

    return {
      statusCode: 503,
      body: error.toString(),
    }
  }

  return {
    statusCode: 200,
    body: '"Invoked successfully!"',
  };
}
