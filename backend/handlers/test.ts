import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { slackApi } from '../api/slack.api';

export const main: APIGatewayProxyHandler = async (event) => {
  const response = await foo(event, undefined, undefined);
  if (response) {
    if (!response.headers) {
      response.headers = {};
    }
    response.headers['Access-Control-Allow-Origin'] = '*';
  }
  return response as APIGatewayProxyResult;
}

const foo: APIGatewayProxyHandler = async () => {
  await slackApi.post({
    channel: '#slack-test',
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "New bug reported"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "OK",
              "emoji": true
            },
            "style": "primary",
            "value": "verified",
            "action_id": "resolve-verified"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Not OK",
              "emoji": true
            },
            "style": "danger",
            "value": "notabug",
            "action_id": "resolve-notabug",
            "confirm": {
              "title": {
                "type": "plain_text",
                "text": "Are you sure?"
              },
              "text": {
                "type": "mrkdwn",
                "text": "This will close the bug without resolution."
              },
              "confirm": {
                "type": "plain_text",
                "text": "Mark as Not A Bug"
              },
              "deny": {
                "type": "plain_text",
                "text": "Cancel"
              }
            }
          }
        ]
      }
    ]
  });

  return {
    body: '',
    statusCode: 204,
  };
}
