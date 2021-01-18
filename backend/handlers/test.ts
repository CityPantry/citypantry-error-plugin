import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { slackApi } from '../api/slack.api';
import { ActionIds } from '../services/slack-body';

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
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Developer actions:'
        }
      },
      {
        "type": "actions",
        "block_id": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "OK",
              "emoji": true
            },
            "style": "primary",
            "value": 'CPD-11684',
            "action_id": ActionIds.RESOLVE_VERIFIED
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Not OK",
              "emoji": true
            },
            "style": "danger",
            "value": 'CPD-11684',
            "action_id": ActionIds.RESOLVE_NOTABUG,
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
