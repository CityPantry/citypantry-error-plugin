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
`1. ${params.name}
2. ${params.description}
3. ${params.impact}
4. ${params.affectedPeople}
5. ${params.url}
6. ${params.time}
7. ${params.stepsToReproduce}
8. ${params.currentUser}
9. ${params.isMasquerading}
10. ${params.urgency}`;

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
