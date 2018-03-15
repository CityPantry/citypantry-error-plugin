import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';

export async function report(request: HandlerRequest): Promise<HandlerResponse> {

  const lines: string[] = [];

  const params = request.body; // as BugReport;

  console.log(params);
    
  for (let i = 0;  i < params.length; i++) {
    lines.push(i + ". " + params[i]);
  }

  slackApi
    .post(lines.join('\n'))
    .catch(reason => console.log(reason));

  return {
    statusCode: 200,
    body: '"Invoked successfully!"',
  };
}
