import { JiraIssueEvent } from '@models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { config, TeamConfig, Teams } from '../../config';
import { BlockData, slackApi } from '../api/slack.api';

export const main: APIGatewayProxyHandler = async (apiEvent) => {
  const event: JiraIssueEvent = JSON.parse(apiEvent.body);

  await processEvent(event);

  return {
    statusCode: 201,
    body: '',
  };
}

async function processEvent(event: JiraIssueEvent): Promise<void> {

  const isCreateEvent = event.webhookEvent === 'jira:issue_created';
  const createdWithDevTeamField = isCreateEvent && !!event.issue.fields.customfield_10922;
  const devTeamFieldWasUpdated = event.changelog.items.some((item) => item.fieldId === 'customfield_10922');

  if (!createdWithDevTeamField && !devTeamFieldWasUpdated) {
    return;
  }

  const previousValue = isCreateEvent ? null : event.changelog.items.find((item) => item.fieldId === 'customfield_10922').from as string | null;
  const previousTeams = previousValue ? findTeamsByChangelogValue(previousValue) : [];

  const newValue = event.issue.fields.customfield_10922;
  const newTeams = newValue ? newValue.map(({id}) => Teams.get(id)).filter(Boolean) : [];

  const teamsAdded = newTeams.filter(({id}) => !previousTeams.find(({id: previousId}) => `${previousId}` === `${id}`));

  if (!teamsAdded.length) {
    return;
  }

  const issueKey = event.issue.key;
  const issueLink = `${config.jiraServer}/browse/${issueKey}`;

  await Promise.all(teamsAdded.map(async (team) => {
    const blocks = generateBlocks({
      issueKey,
      issueLink,
      issueTitle: event.issue.fields.summary,
      issueDescription: event.issue.fields.description,
      teamName: team.name,
      userName: event.user.displayName,
    });

    try {
      await slackApi.post({
        blocks,
        channel: team.slackChannel,
        username: 'Bug Monitoring',
      });
    } catch (e) {
      console.log('ERROR', e);
    }
  }));
}

function findTeamsByChangelogValue(changelogValue: string): TeamConfig[] {
  try {
    const idList = JSON.parse(changelogValue);

    return idList.map((id) => Teams.get(id)).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function generateBlocks(data: { userName: string, teamName: string, issueLink: string, issueKey: string, issueTitle: string, issueDescription: string }): BlockData[] {
  const MAX_LINES = 5;
  const MAX_CHARACTERS = 300;

  let description = data.issueDescription || '';
  description = description.trim();
  const lines = description.split('\n');
  const lineBreakIndex = lines.slice(0, MAX_LINES).map((line) => line.length + 1).reduce((a, b) => a + b, 0) - 1;
  const breakPoint = Math.min(description.length, lineBreakIndex, MAX_CHARACTERS);
  const shortDescription = description ? description.substr(0, breakPoint) + (breakPoint <= description.length ? '…' : '') : '';

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `A bug was assigned to ${data.teamName} team by *${data.userName}*:`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${data.issueLink}|${data.issueKey}: ${data.issueTitle}>*`
      }
    },
    shortDescription && {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${shortDescription}`
      }
    },
    {
      type: 'divider'
    },
  ].filter(Boolean);
}
