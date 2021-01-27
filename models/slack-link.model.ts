export type SlackUrl = string;

export interface SlackLink {
  permalink: SlackUrl;
  channel: string;
  ts: string;
}
