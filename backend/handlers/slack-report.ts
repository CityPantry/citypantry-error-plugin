import { HandlerRequest, HandlerResponse } from 'serverless-api-handlers';

export async function hello(request: HandlerRequest, done: (response?: HandlerResponse) => void): Promise<HandlerResponse> {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  return response;
}
