import { config } from '../../config';
import axios from 'axios';

export const API_PATH = config.jiraServer + '/rest/api/2';
const auth = {
  username: config.jiraUser,
  password: config.jiraToken
};

export const jiraApi = {
  async createIssue(bug: any): Promise<void> {
    await axios(`${API_PATH}/issue/`, {
      method: 'post',
      data: {
        body: bug,
      },
      auth
    });
  },
};
