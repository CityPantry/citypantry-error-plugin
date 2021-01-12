import { JiraIssueEvent } from '@models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { config, TeamConfig, Teams } from '../../config';
import { BlockData, slackApi } from '../api/slack.api';

export const main: APIGatewayProxyHandler = async (apiEvent) => {
  const event: JiraIssueEvent = JSON.parse(apiEvent.body);

  await processEvent(event); // Run asynchronously; return immediately

  return {
    statusCode: 201,
    body: '',
  };
}

async function processEvent(event: JiraIssueEvent): Promise<void> {
  console.log('Webhook event: ', JSON.stringify(event, null, 2));

  let isCreateEvent = isCreate(event);
  const createdWithDevTeamField = isCreateEvent && !!event.issue.fields.customfield_10922;
  if (!createdWithDevTeamField &&
    !event.changelog.items.some((item) => item.fieldId === 'customfield_10922')
  ) {
    return;
  }

  const previousValue = isCreateEvent ? null : event.changelog.items.find((item) => item.fieldId === 'customfield_10922').from as string | null;
  const newValue = event.issue.fields.customfield_10922;

  const previousTeams = previousValue ? findTeamsByChangelogValue(previousValue) : [];
  const newTeams = newValue ? newValue.map(({id}) => Teams.get(id)).filter(Boolean) : [];

  console.log('Dev Team Updated', previousValue, previousTeams, newValue, newTeams);

  // TODO this is not correctly filtering out old teams
  const teamsAdded = newTeams.filter(({id}) => !previousTeams.find(({id: previousId}) => previousId === id));

  console.log('New Teams:', teamsAdded);

  if (!newTeams.length) {
    return;
  }

  const issueKey = event.issue.key;
  const issueLink = `${config.jiraServer}/browse/${issueKey}`;

  await Promise.all(newTeams.map(async (team) => {
    const blocks = generateBlocks({
      issueKey,
      issueLink,
      issueTitle: event.issue.fields.summary,
      issueDescription: event.issue.fields.description,
      teamName: team.name,
      userName: event.user.displayName,
    });

    // const postText = `Bug <${issueKey}|${issueLink}> was assigned to ${team.name} team by ${event.user.displayName}`;
    // const description = (event.issue.fields.description || '').trim();
    // const attachments: any[] = [{
    //   'fallback': `Bug ${issueKey}`,
    //   'title': `${issueKey}: ${event.issue.fields.summary}`,
    //   'title_link': issueLink,
    //   'text': `${description.length > 300 ? description.substr(0, 300).trimRight() + '…' : description}${description ? '\n\n' : ''}<View Issue|${issueLink}>`,
    // }];

    console.log('Posting for team:', team.name);

    try {
      await slackApi.post({
        blocks,
        channel: team.slackChannel,
        username: 'Bug Monitoring',
        // attachments,
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

function isCreate(event: JiraIssueEvent): boolean {
  return event.webhookEvent === 'jira:issue_created';
}
/*
    {
      "field": "Dev Team",
      "fieldtype": "custom",
      "fieldId": "customfield_10922",
      "from": "[10244]",
      "fromString": "Supply",
      "to": "[10218, 10244]",
      "toString": "Fulfilment,Supply"
    }
*/

function generateBlocks(data: { userName: string, teamName: string, issueLink: string, issueKey: string, issueTitle: string, issueDescription: string }): BlockData[] {
  let description = data.issueDescription || '';
  description = description.trim();
  const lines = description.split('\n');
  const lineBreakIndex = lines.slice(0, 3).map((line) => line.length + 1).reduce((a, b) => a + b, 0) - 1;
  const breakPoint = Math.min(description.length, lineBreakIndex, 300);
  const shortDescription = description.substr(0, breakPoint) + (breakPoint <= description.length ? '…' : '');

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `A bug was assigned to ${data.teamName} team by ${data.userName}.`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${data.issueLink}|${data.issueKey}: ${data.issueTitle}>*\n\n${shortDescription}${shortDescription ? '\n\n' : ''}<${data.issueKey}|${data.issueLink}>`
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Bug',
            emoji: true
          },
          value: 'open_bug',
          url: data.issueLink
        }
      ]
    }
  ];
}
