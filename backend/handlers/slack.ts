import { APIGatewayProxyHandler } from 'aws-lambda';
import * as QueryString from 'querystring';
import { slackApi } from '../api/slack.api';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    slackApi.checkValidity(event.body, event.headers);
  } catch (e) {
    return {
      body: e.message,
      statusCode: 401
    }
  }

  const qs = QueryString.decode(event.body);
  console.log(JSON.parse(qs['payload'] as string));

  return {
    body: '',
    statusCode: 204,
  }
}
