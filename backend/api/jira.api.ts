import { config } from '../../config';
import axios from 'axios';
import { Urgency } from '../../models';

export const API_PATH = config.jiraServer + '/rest/api/2';
const auth = {
  username: config.jiraUser,
  password: config.jiraToken
};

export interface Bug {
  summary: string;
  description: string;
  urgency: Urgency;
}

export class JiraApi {
  public async createIssue(bug: Bug): Promise<string> {

    const priority = this.getPriority(bug.urgency);

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

  private getPriority(urgency: Urgency): string {
    switch (urgency) {
      case Urgency.LOW: return '5'; // Lowest
      case Urgency.MEDIUM: return '3'; // Medium
      case Urgency.HIGH: return '2'; // High
      case Urgency.IMMEDIATE: return '1'; // Highest
    }
  }
}

export const jiraApi = new JiraApi();
