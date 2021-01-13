import { config } from '../../config';
import axios from 'axios';
import { IncidentSize } from '@models';

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
  public async createIssue(bug: Bug): Promise<string> {

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

    const { data } = await axios.post(`${API_PATH}/issue`, { fields }, {
      auth
    });

    return data.key;
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
