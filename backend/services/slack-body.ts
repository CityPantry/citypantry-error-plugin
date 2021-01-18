import { Report, toHumanString } from '@models';
import { config } from '../../config';
import { BlockData, BlocksPostData } from '../api/slack.api';

export enum ActionIds {
  RESOLVE_VERIFIED = 'resolve-verified',
  RESOLVE_NOTABUG = 'resolve-notabug',
}

export interface SlackResponseAction {
  action_id: string; //'resolve-verified',
  block_id: string; //'gYcZ0',
  text: unknown; //[Object],
  value: string; //'verified',
  style: string; //'primary',
  type: string; //'button',
  action_ts: string; //'1610984294.153606'
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
        }
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

export function createAssignActions(issueKey: string, userId: string): BlockData {
  issueKey = issueKey + '';
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:syringe: Issue marked as *verified* by <@${userId}>`
    }
  };
}

export function createClosedBlocks(issueKey: string, userId: string): BlockData {
  issueKey = issueKey + '';
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `:x: Issue marked as *not a bug* by <@${userId}>`
    }
  };
}
