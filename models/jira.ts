export interface ApiObject {
  self: string; // "https://citypantry.atlassian.net/rest/api/2/issuetype/1";
}

export type IssueKey = string;

export interface JiraCommentEvent {
  timestamp: number; // Milliseconds e.g. 1518873292317
  // https://developer.atlassian.com/server/jira/platform/webhooks/
  webhookEvent: 'comment_deleted' | 'comment_created' | 'comment_updated' | any; // TODO
  comment: Comment;
  issue: SimpleIssue;
}

export function isCommentEvent(event: JiraCommentEvent | JiraIssueEvent): event is JiraCommentEvent {
  return ['comment_deleted', 'comment_created', 'comment_updated'].indexOf(event.webhookEvent) >= 0;
}

export interface JiraIssueEvent {
  timestamp: number; // Milliseconds e.g. 1518873292317
  // https://developer.atlassian.com/server/jira/platform/webhooks/
  webhookEvent: 'jira:issue_created' | 'jira:issue_updated' | 'jira:issue_deleted' | any;
  issue_event_type_name: "issue_assigned" | unknown;
  user: User;
  issue: DetailedIssue;
  changelog: Changelog;
}

export function isIssueEvent(event: JiraCommentEvent | JiraIssueEvent): event is JiraIssueEvent {
  return ['jira:issue_created' , 'jira:issue_updated', 'jira:issue_deleted'].indexOf(event.webhookEvent) >= 0;
}

export interface User extends ApiObject {
  name: string; //"paul";
  key: string; //"paul";
  accountId: string; //"557058:faaac56e-3bb4-43b2-88d2-ccedadca7d31";
  avatarUrls: AvatarUrls;
  displayName: string; //"Paul Lessing";
  active: boolean;
  timeZone: string; //"Europe/London"
  emailAddress?: string; // "paul@citypantry.com";
}

export interface Comment extends ApiObject {
  id: string; // "30341";
  author: User;
  body: string; // "Adding new comment";
  updateAuthor: User;
  created: string; // "2018-02-17T12:52:23.827+0000";
  updated: string; // "2018-02-17T12:52:23.827+0000"
}

export interface BaseIssue extends ApiObject {
  id: string; // numeric
  key: IssueKey; // "CPD-2541";
  fields: object;
}

export interface IssueWithSummaryAndComments extends BaseIssue {
  fields: {
    summary: string;
  } & IssueFieldComments;
}

export interface SimpleIssue extends BaseIssue {
  fields: IssueFields;
}

export interface DetailedIssue extends SimpleIssue {
  fields: DetailedIssueFields;
}

export interface Issue extends DetailedIssue, IssueWithSummaryAndComments {
  fields: DetailedIssueFields & IssueFieldComments;
}

export interface IssueFields {
  summary: string; // "TEST BUG PLEASE IGNORE";
  issuetype: IssueType;
  project: Project;
  assignee: User;
  priority: Priority;
  status: Status;
}

export interface BugReport {
  fields: {
    summary: string;
    description: string;
    priority: {
      name: string;
    }
    issuetype: {
      name: string;
    };
  };
}

export interface DetailedIssueFields extends IssueFields, CustomFields {
  description: string; // "@paul related";
  creator: User;
  reporter: User;
  assignee: User;
  lastViewed: string; // "2018-02-17T13:14:52.159+0000";
  created: string; // "2018-02-16T17:59:27.732+0000";
  updated: string; // "2018-02-17T13:14:52.224+0000";

  aggregateprogress: Progress;
  progress: Progress;
  votes: {
    self: string; // "https://citypantry.atlassian.net/rest/api/2/issue/CPD-2541/votes";
    votes: number;
    hasVoted: boolean;
  };
  watches: {
    self: string; // "https://citypantry.atlassian.net/rest/api/2/issue/CPD-2541/watchers";
    watchCount: number; // 0
    isWatching: boolean;
  };

  timespent: unknown | null;
  fixVersions: unknown[];
  aggregatetimespent: unknown | null;
  resolution: unknown | null;
  resolutiondate: unknown | null;
  workratio: number; // -1

  labels: unknown[];
  aggregatetimeoriginalestimate: unknown | null;
  timeestimate: unknown | null;
  versions: unknown[];
  issuelinks: unknown[];
  components: unknown[];
  timeoriginalestimate: unknown | null;
  timetracking: unknown;
  security: unknown | null;
  attachment: unknown[];
  aggregatetimeestimate: unknown | null;
  subtasks: unknown[];
  environment: unknown;
  duedate: unknown;
}

export interface IssueFieldComments extends DetailedIssueFields {
  comment: {
    comments: Comment[];
    maxResults: number; // 2,
    total: number; // 2,
    startAt: number; // 0
  }
}

export interface IssueType extends ApiObject {
  id: string; // "1";
  description: string; // "A problem which impairs or prevents the functions of the product.";
  iconUrl: string; // "https://citypantry.atlassian.net/secure/viewavatar?size=xsmall&avatarId=10303&avatarType=issuetype";
  name: string; // "Bug";
  subtask: boolean; // false;
  avatarId: number; // 10303
}

export interface Project extends ApiObject {
  id: string; // "10000";
  key: string; // "CPD";
  name: string; // "City Pantry Dev";
  projectTypeKey: string; // "software";
  avatarUrls: AvatarUrls;
}

export interface AvatarUrls {
  "48x48": string; // "https://citypantry.atlassian.net/secure/projectavatar?pid=10000&avatarId=12065";
  "24x24": string; // "https://citypantry.atlassian.net/secure/projectavatar?size=small&pid=10000&avatarId=12065";
  "16x16": string; // "https://citypantry.atlassian.net/secure/projectavatar?size=xsmall&pid=10000&avatarId=12065";
  "32x32": string; // "https://citypantry.atlassian.net/secure/projectavatar?size=medium&pid=10000&avatarId=12065"
}

export interface Priority extends ApiObject {
  self: string; // "https://citypantry.atlassian.net/rest/api/2/priority/3";
  iconUrl: string; // "https://citypantry.atlassian.net/images/icons/priorities/medium.svg";
  name: string; // "Medium";
  id: string; // "3"
}

export interface Status extends ApiObject {
  description: string; // "";
  iconUrl: string; // "https://citypantry.atlassian.net/images/icons/subtask.gif";
  name: string; // "To Do";
  id: string; // "10000";
  statusCategory: StatusCategory;
}

export interface StatusCategory extends ApiObject {
  id: number; // 2;
  key: string; // "new";
  colorName: string; // "blue-gray";
  name: string; // "To Do"
}

export interface Progress {
  progress: number;
  total: number;
}

export interface Changelog {
  id: string; // "58069";
  items: ChangelogEntry[];
}

export interface ChangelogEntry {
  field: string; // "assignee";
  fieldtype: string; // "jira";
  fieldId: keyof DetailedIssueFields; // "assignee";
  from: any; // null;
  fromString: string; // null;
  to: any; // "paul";
  toString: string; // "Paul Lessing"
}

/*
Changed to "Done"

"items": [
  {
    "field": "resolution",
    "fieldtype": "jira",
    "fieldId": "resolution",
    "from": null,
    "fromString": null,
    "to": "10000",
    "toString": "Done"
  },
  {
    "field": "status",
    "fieldtype": "jira",
    "fieldId": "status",
    "from": "10000",
    "fromString": "To Do",
    "to": "10001",
    "toString": "Done"
  }
]

Changed to "Closed"

"items": [
  {
    "field": "resolution",
    "fieldtype": "jira",
    "fieldId": "resolution",
    "from": null,
    "fromString": null,
    "to": "10000",
    "toString": "Done"
  },
  {
    "field": "status",
    "fieldtype": "jira",
    "fieldId": "status",
    "from": "3",
    "fromString": "In Progress",
    "to": "6",
    "toString": "Closed"
  }
]
*/

interface DevTeamField extends ApiObject {
  value: string; // 'Supply'
  id: string; // '10244'
}

export interface CustomFields {
  customfield_10000: unknown | null;
  customfield_10001: unknown | null;
  customfield_10003: unknown | null;
  customfield_10004: unknown | null;
  customfield_10005: unknown | null;
  customfield_10007: unknown[];
  customfield_10008: unknown | null;
  customfield_10012: string; // "0|i00bfq:";
  customfield_10014: unknown | null;
  customfield_10015: unknown | null;
  customfield_10016: unknown | null;
  customfield_10017: unknown | null;
  customfield_10018: unknown | null;
  customfield_10019: unknown | null;
  customfield_10020: unknown | null;
  customfield_10021: unknown | null;
  customfield_10022: unknown | null;
  customfield_10023: unknown | null;
  customfield_10100: unknown | null;
  customfield_10200: unknown | null;
  customfield_10300: string; // "{}";
  customfield_10400: unknown | null;
  customfield_10500: unknown | null;
  customfield_10501: unknown | null;
  customfield_10700: unknown | null;
  customfield_10800: unknown | null;
  customfield_10910: unknown | null;
  customfield_10922: DevTeamField | null; // Dev Team; string representation in history is e.g. "Fulfilment,Supply"; native rep. = "[10218, 10244]" or null
}

export function isApiObject(o): o is ApiObject {
  return o && o.hasOwnProperty('self') && typeof o.self === 'string';
}
