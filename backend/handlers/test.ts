import { IncidentSize, Report } from '@models';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { slackApi } from '../api/slack.api';
import { createSlackBody } from '../services/slack-body';

const fakeReport: Report = {
  time: '2020-01-01 10:00',
  affectedPeople: 'Me',
  currentUser: 'Current User',
  consoleErrors: '',
  incidentSize: IncidentSize.MEDIUM,
  stepsToReproduce: '',
  isMasquerading: true,
  url: 'https://citypantry.com',
  summary: 'Things have gone wrong',
  description: 'Bacon ipsum dolor amet shoulder venison jerky tri-tip shank chuck.\n\nFatback flank ham ham hock salami ribeye shoulder bacon andouille pork chop.\nKielbasa drumstick boudin corned beef ham hock ground round frankfurter andouille short loin shank, chicken meatloaf ham venison.',
  email: 'paul@citypantry.com',
  name: 'Paul Lessing',
  screenshot: null,
  isTest: true,
};

export const main: APIGatewayProxyHandler = async (event) => {
  const response = await test(event, undefined, undefined);
  if (response) {
    if (!response.headers) {
      response.headers = {};
    }
    response.headers['Access-Control-Allow-Origin'] = '*';
  }
  return response as APIGatewayProxyResult;
}

const test: APIGatewayProxyHandler = async () => {
  const { post } = createSlackBody(fakeReport, null, 'CPD-00000');

  await slackApi.post({
    ...post,
    channel: '#slack-test',
  });

  return {
    body: '',
    statusCode: 204,
  };
}
