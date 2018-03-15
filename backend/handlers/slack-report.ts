import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';
import { Report } from '../../models';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {
  console.log('request');
  console.log(request);

  // Shouldn't need to JSON parse this but we can fix later
  const params = JSON.parse(request.body) as Report;

  console.log('body');
  console.log(params);

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
    await slackApi
      .post(formattedReport);
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
