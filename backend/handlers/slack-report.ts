import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';
import { slackApi } from '../api/slack.api';

export async function hello(request: HandlerRequest): Promise<HandlerResponse> {

  slackApi.post("Hello, world!")
    .catch(reason => console.log(reason));

  return {
    statusCode: 200,
    body: '"HIYA"',
  };
}
