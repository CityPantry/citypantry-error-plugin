export type SlackUrl = string;

export interface BugMetadata {
  slackReport?: {
    channel: string;
    messageTs: string;
    url: SlackUrl;
  };
  slackBugMovedLinks: SlackUrl[];
}
