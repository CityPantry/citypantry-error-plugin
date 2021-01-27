import { config } from '../../config';
import axios from 'axios';
import { CustomFieldKeys, IncidentSize, Issue, IssueKey } from '@models';
import { BugMetadata } from '../../models/bug-metadata.interface';

export const API_PATH = config.jiraServer + '/rest/api/3';
const auth = {
  username: config.jiraUser,
  password: config.jiraToken
};

export interface Bug {
  summary: string;
  incidentSize: IncidentSize;
  description: {
    version: 1;
    type: 'doc';
    content: object[];
  };
}

export class JiraApi {
  public async createIssue(bug: Bug): Promise<IssueKey> {

    const priority = this.getPriority();

    const fields = {
      project: {
        key: config.projectKey
      },
      summary: bug.summary,
      issuetype: {
        name: config.bugIssueName
      },
      priority: {
        id: priority
      },
      description: bug.description
    };

    console.log('About to create JIRA ticket', JSON.stringify({ fields }));

    const { data } = await axios.post(
      `${API_PATH}/issue`,
      { fields },
      { auth }
    );

    return data.key;
  }

  public async getIssue(key: IssueKey): Promise<Issue> {
    return (await axios.get<Issue>(
      `${API_PATH}/issue/${key}`,
      {auth},
    )).data;
  }

  public async updateIssueDescription(issueKey: string, description: Bug['description']['content']): Promise<void> {
    await axios.put(
      `${API_PATH}/issue/${issueKey}`,
      {
        update:
          {
            description: [
              {
                set: {
                  version: 1,
                  type: 'doc',
                  content: description
                }
              }
            ]
          }
        },
      { auth }
    );
  }

  public async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    await axios.post(
      `${API_PATH}/issue/${issueKey}/transitions`,
      {
        transition: {
          id: transitionId
        }
      },
      { auth }
    );
  }

  public async addComment(issueKey: string, comment: string): Promise<void> {
    await axios.post(
      `${API_PATH}/issue/${issueKey}/comment`,
      {
        body: {
          version: 1,
          type: 'doc',
          content: [
            Document.p(comment),
          ]
        }
      },
      { auth }
    );
  }

  public async assignToTeam(issueKey: string, teamId: string): Promise<void> {
    await axios.put(
      `${API_PATH}/issue/${issueKey}`,
      {
        update:
          {
            customfield_10922: [
              {
                add: {
                  id: teamId
                }
              }
            ]
          }
      },
      {auth}
    );
  }

  public async updateMetadata(issueKey: IssueKey, metadataProps: Partial<BugMetadata>): Promise<Issue> {
    const issue = await this.getIssue(issueKey);

    let metadata = {};
    try {
      metadata = JSON.parse(issue.fields[CustomFieldKeys.BugMetadata] || '{}');
    } catch (e) {
      console.log('Failed to parse issue metadata:', e);
    }

    const newMetadata = { ...metadata, ...metadataProps };
    const updatedFields = {
      [CustomFieldKeys.BugMetadata]: JSON.stringify(newMetadata),
    }

    console.log('Updating metadata', updatedFields);

    const response = await axios.put(
      `${API_PATH}/issue/${issueKey}`,
      { fields: updatedFields },
      {auth},
    );

    console.log('Result:', response.status, response.data);

    return {
      ...issue,
      fields: {
        ...issue.fields,
        ...updatedFields,
      }
    }
  }

  private getPriority(): string {
    return '3'; // Medium, as bugs are prioritised manually
  }
}

export namespace Document {
  export function h(level: number, text: string): object {
    return {
      type: 'heading',
      attrs: { level },
      content: [Document.text(text)]
    };
  }

  export function p(...text: (string | object)[]): object {
    return {
      type: 'paragraph',
      content: text.map((value) => typeof value === 'string' ? Document.text(value) : value),
    };
  }

  export function text(text: string, ...marks: string[]): object {
    return {
      type: 'text',
      text,
      marks: marks.map((mark) => ({ type: mark }))
    };
  }

  export function link(text: string, url?: string): object {
    return {
      type: 'text',
      text,
      marks: [{
        type: 'link',
        attrs: {
          href: url || text
        }
      }]
    };
  }

  export const br = {
    type: 'hardBreak'
  };
}

export const jiraApi = new JiraApi();
