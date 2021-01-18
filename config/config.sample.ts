export const config = {
  slackUrl: '/services/XXXXXXXXX/YYYYYYYYY/zzzzzzzzzzzzzzzzzzzzzzzz',
  slackBotToken: 'xoxb-xxxxxxxx-yyyyyyyyy',
  authorisedUserGroupId: 'ID of the user group permitted to change issues',
  username: 'Bug Watcher',
  channel: '#channel-name',
  jiraUser: 'user@email.com',
  jiraToken: 'token from https://id.atlassian.com/manage/api-tokens',
  jiraServer: 'https://your-organisation.atlassian.net',
  projectKey: 'The project key is the prefix that your stories have e.g. ABC-123 has project key ABC',
  bugIssueName: 'Most likely "Bug" or similar.',
  transitionIds: {
    closed: '31',
    verified: '221',
  }
};
