import { config } from '../../config';
import axios from 'axios';

const AUTH_HEADERS = {
  'Authorization': `Bearer ${config.slackBotToken}`
};

export interface BasicPostData {
  channel?: string;
  username?: string;
  attachments?: any[];
}

export interface TextPostData extends BasicPostData {
  text: string;
}

function isTextPost(postData: BasicPostData): postData is TextPostData {
  return postData.hasOwnProperty('text');
}

export interface BlocksPostData extends BasicPostData {
  blocks: BlockData[];
}

function isBlocksPost(postData: BasicPostData): postData is TextPostData {
  return postData.hasOwnProperty('blocks');
}

export interface BlockData {
  type: string;
  [key: string]: any;
}

export class SlackApi {

  async post(props: TextPostData | BlocksPostData): Promise<string> {
    const { channel, username, attachments } = props;

    const data: any = {
      channel: channel || config.channel,
      username: username || config.username,
      attachments
    };

    if (isTextPost(props)) {
      data.text = props.text;
    } else if (isBlocksPost(props)) {
      data.blocks = props.blocks;
    }

    console.log('Posting to slack', data);

    const response = await axios(`https://slack.com/api/chat.postMessage`, {
      method: 'post',
      data,
      headers: AUTH_HEADERS,
    });

    return await this.getPermalink(response.data);
  }

  async getPermalink(message: { channel: string, ts: string }): Promise<string> {
    const response = await axios.get(`https://slack.com/api/chat.getPermalink`, {
      params: {
        channel: message.channel,
        message_ts: message.ts
      },
      headers: AUTH_HEADERS,
    });

    if (response.status >= 200 && response.status < 300 && response.data.ok) {
      return response.data.permalink;
    } else {
      console.log('Unable to get permalink', response.status, JSON.stringify(response.data));
      return '';
    }
  }

  async findUserByEmail(email: string): Promise<{ id: string, name: string, real_name: string } | null> {
    const response = await axios.get(`https://slack.com/api/users.lookupByEmail`, {
      params: {
        email
      },
      headers: AUTH_HEADERS,
    });

    if (response.status >= 200 && response.status < 300 && response.data.ok) {
      return response.data.user;
    } else {
      console.log('Unable to get permalink', response.status, JSON.stringify(response.data));
      return null;
    }
  }
}

export const slackApi = new SlackApi();
