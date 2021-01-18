import { Report, toHumanString } from '@models';
import { config, teams } from '../../config';
import { BlockData, BlocksPostData } from '../api/slack.api';

export enum ActionIds {
  RESOLVE_VERIFIED = 'resolve-verified',
  RESOLVE_NOTABUG = 'resolve-notabug',
  ASSIGN_TEAM = 'assign-team',
}

export type SlackResponseAction = {
  type: string; //'button',
  action_id: string; //'resolve-verified',
  block_id: string; //'gYcZ0',
  action_ts: string; //'1610984294.153606'

  // Button
  text?: unknown; //[Object],
  value?: string; //'verified',
  style?: string; //'primary',

  // Select
  selected_option?: {
    text: unknown;
    value: string;
  }; // { text: [Object], value: 'CPD-11684|10244' },
  placeholder?: unknown; // { type: 'plain_text', text: 'Assign to a Dev Team', emoji: true },
}

export function getAction(slackResponseBody: any, actionId: ActionIds): SlackResponseAction | null {
  return slackResponseBody.actions.find(({ action_id }) => action_id === actionId);
}

export function createSlackBody(report: Report, slackId: string | null, issueKey: string): { post: BlocksPostData, threadReply: BlockData[] } {
  const jiraLink = `${config.jiraServer}/browse/${issueKey}`;
  return {
    post: {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'New bug reported:'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${jiraLink}|${issueKey}: ${report.summary}>*`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*URL:* <${report.url}|${report.url}>`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*What's Wrong?*\n${report.description}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Incident Size:* ${toHumanString(report.incidentSize)}\n*Reporter:* ${report.name}${slackId ? `(<@${slackId}>)` : ''}`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          block_id: 'actions_prompt',
          text: {
            type: 'mrkdwn',
            text: 'Developer actions:'
          }
        },
        {
          type: 'actions',
          block_id: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Mark Verified',
                emoji: true
              },
              style: 'primary',
              value: issueKey,
              action_id: ActionIds.RESOLVE_VERIFIED
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Close as Not A Bug',
                emoji: true
              },
              style: 'danger',
              value: issueKey,
              action_id: ActionIds.RESOLVE_NOTABUG,
              confirm: {
                title: {
                  type: 'plain_text',
                  text: 'Are you sure?',
                },
                text: {
                  type: 'mrkdwn',
                  text: 'This will close the bug without resolution.',
                },
                confirm: {
                  type: 'plain_text',
                  text: 'Mark as Not A Bug',
                },
                deny: {
                  type: 'plain_text',
                  text: 'Cancel',
                }
              }
            }
          ]
        },
        {
          type: 'divider'
        },
      ]
    },
    threadReply: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Affected People:* ${report.affectedPeople}
*Time:* ${report.time}

*Steps to Reproduce*:
_${report.isMasquerading ? 'Masquerading' : 'Logged in'} as ${report.currentUser}_
<${report.url}|${report.url}>

${report.stepsToReproduce}`
        }
      }
    ],
  };
}

export interface BlockUpdate {
  (blocks: BlockData[]): BlockData[];
}

function replace(oldId: string, ...newItems: BlockData[]): BlockUpdate {
  return (blocks) => {
    blocks = blocks.slice();
    const index = blocks.findIndex(({ block_id }) => block_id === oldId);
    blocks.splice(index, 1, ...newItems);

    return blocks;
  };
}

function chain(...updates: BlockUpdate[]): BlockUpdate {
  return (blocks) => {
    for (const update of updates) {
      blocks = update(blocks);
    }
    return blocks;
  };
}

export function createAssignActions(issueKey: string, userId: string): BlockUpdate {
  return chain(
    replace('actions_prompt', {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:syringe: Issue marked as *verified* by <@${userId}>`
      }
    }),
    replace('actions', {
      type: 'section',
      block_id: 'actions_prompt',
      text: {
        type: 'mrkdwn',
        text: `Choose a team to assign:`
      }
    }, {
      block_id: 'actions',
      type: 'actions',
      elements: [
        {
          type: 'static_select',
          action_id: ActionIds.ASSIGN_TEAM,
          placeholder: {
            type: 'plain_text',
            text: 'Assign to a Dev Team',
            emoji: true
          },
          options: teams.map(({ name, id }) => ({
            text: {
              type: 'plain_text',
              text: name,
              emoji: true
            },
            value: `${issueKey}|${id}`,
          })),
        }
      ]
    })
  );
}

export function createMovedToTeamBlocks(teamName: string, userId: string): BlockUpdate {
  return chain(
    replace('actions_prompt'),
    replace('actions', {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:wrench: Issue assigned to *${teamName} team* by <@${userId}>`
      }
    }),
  );
}

export function createClosedBlocks(userId: string): BlockUpdate {
  return chain(
    replace('actions_prompt'),
    replace('actions', {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:x: Issue marked as *not a bug* by <@${userId}>`
      }
    }),
  );
}
