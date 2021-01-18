import { APIGatewayProxyHandler, APIGatewayProxyResult, Callback } from 'aws-lambda';
import axios from 'axios';
import * as QueryString from 'querystring';
import { config } from '../../config';
import { jiraApi } from '../api/jira.api';
import { BlockData, slackApi } from '../api/slack.api';
import { ActionIds, createAssignActions, createClosedBlocks, getAction } from '../services/slack-body';

export const main: APIGatewayProxyHandler = (event, _, callback) => {
  try {
    slackApi.checkValidity(event.body, event.headers);
  } catch (e) {
    return callback(null, {
      body: e.message,
      statusCode: 401
    });
  }

  const qs = QueryString.decode(event.body);

  const body = JSON.parse(qs['payload'] as string);

  run(body, callback).then(() => {
    console.log('Finished executing')
  }, (e) => {
    console.log('FAILED', e);
  });
}

async function run(body: any, callback: Callback<APIGatewayProxyResult>): Promise<void> {
  const userId = body.user.id;
  const allowedSlackIds = await slackApi.getUserIdsInGroup(config.authorisedUserGroupId);
  const userIsAuthorised = !!~allowedSlackIds.indexOf(userId);
  console.log('User is authorised', userIsAuthorised);
  if (!userIsAuthorised) {
    await slackApi.postEphemeral({
      channel: body.channel.id,
      user: userId,
      text: 'Only @developers can change the status of bugs.'
    })
    return callback(null, {
      body: 'Not Authorised',
      statusCode: 403,
    });
  }

  console.log('Early return');
  // Return early
  callback(null, {
    body: '',
    statusCode: 200,
  });

  const resolveAction = getAction(body, ActionIds.RESOLVE_VERIFIED);
  const closeAction = getAction(body, ActionIds.RESOLVE_NOTABUG);

  let newActions = null;

  console.log('Resolve action', resolveAction);
  if (resolveAction) {
    const issueKey = resolveAction.value;
    console.log('Updating jira: resolve');
    await jiraApi.transitionIssue(issueKey, config.transitionIds.verified);

    newActions = createAssignActions(issueKey, body.user.id);
  } else if (closeAction) {
    const issueKey = closeAction.value;
    console.log('Updating jira: close');
    await jiraApi.transitionIssue(issueKey, config.transitionIds.closed);

    newActions = createClosedBlocks(issueKey, body.user.id);
  }

  if (newActions) {
    if (!Array.isArray(newActions)) {
      newActions = [newActions];
    }
    const blocks: BlockData[] = body.message.blocks.slice();
    const index = blocks.findIndex(({ block_id }) => block_id === 'actions');
    blocks.splice(index, 1, ...newActions);
    const newMessage = {
      blocks,
    };

    const responseUrl = body.response_url;
    await axios.post(responseUrl, newMessage);
  }
}

/*{
  type: 'block_actions',
  user: {
    id: 'U4L0Q6V6V',
    username: 'paul',
    name: 'paul',
    team_id: 'T02V5NQ8B'
  },
  api_app_id: 'AARHD5BD4',
  token: '1sqMkITkQk5aPG1OnNqCb5Q2',
  container: {
    type: 'message',
    message_ts: '1610983051.001000',
    channel_id: 'CTPUBREKZ',
    is_ephemeral: false
  },
  trigger_id: '1647396957586.2991772283.986f7eb3c5664121e84bc01164a42ed1',
  team: { id: 'T02V5NQ8B', domain: 'citypantry' },
  enterprise: null,
  is_enterprise_install: false,
  channel: { id: 'CTPUBREKZ', name: 'slack-test' },
  message: {
    bot_id: 'B01K8N1TG3S',
    type: 'message',
    text: 'This content can’t be displayed.',
    user: 'U01JC3V2N14',
    ts: '1610983051.001000',
    team: 'T02V5NQ8B',
    blocks: [ [Object], [Object], [Object] ]
  },
  response_url: 'https://hooks.slack.com/actions/T02V5NQ8B/1632623556071/XQKHqI69r5oHa4ZsA6SgcZfk',
  actions: [
    {
      action_id: 'resolve-verified',
      block_id: 'gYcZ0',
      text: [Object],
      value: 'verified',
      style: 'primary',
      type: 'button',
      action_ts: '1610984294.153606'
    }
  ]
}*/
