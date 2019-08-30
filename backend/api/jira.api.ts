import { config } from '../../config';
import axios from 'axios';
import { IncidentSize } from '../../models';

export const API_PATH = config.jiraServer + '/rest/api/2';
const auth = {
  username: config.jiraUser,
  password: config.jiraToken
};

export interface Bug {
  summary: string;
  description: string;
  incidentSize: IncidentSize;
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

export const jiraApi = new JiraApi();
