import { SlackLink } from './slack-link.model';

export interface BugMetadata {
  slackReport?: SlackLink;
  slackBugMovedLinks: SlackLink[];
}
