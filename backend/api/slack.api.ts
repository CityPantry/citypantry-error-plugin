import axios from 'axios';
import * as FormData from 'form-data';
import { config } from '../../config';

const AUTH_HEADERS = {
  'Authorization': `Bearer ${config.slackBotToken}`
};

export interface BasicPostData {
  channel?: string;
  threadTs?: string; // For replying to a thread
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

export interface MessageData {
  ts: string;
  channel: string;
  permalink: string;
}

export class SlackApi {

  async post(props: TextPostData | BlocksPostData): Promise<MessageData> {
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

    if (props.threadTs) {
      data.thread_ts = props.threadTs;
    }

    console.log('Posting to slack', JSON.stringify(data));

    const response = await axios(`https://slack.com/api/chat.postMessage`, {
      method: 'post',
      data,
      headers: AUTH_HEADERS,
    });

    if (response.status < 200 || response.status > 299 || !response.data.ok) {
      console.log('Failed to post', response.status, response.data);
      throw new Error('Unable to post to Slack');
    }

    console.log('Posted to Slack', response.status, response.data);

    const permalink = await this.getPermalink(response.data);

    return {
      permalink,
      channel: response.data.channel,
      ts: response.data.ts
    };
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

  async uploadImage({ data, channels, threadTs, filename }: { data: Buffer, channels?: string, threadTs?: string, filename?: string }): Promise<any> {
    const formData = new FormData();

    if (filename) {
      formData.append('filename', filename);
    }
    if (channels) {
      formData.append('channels', channels);
    }
    if (threadTs) {
      formData.append('thread_ts', threadTs);
    }

    console.log('Uploading image:', { channels, threadTs, filename });

    formData.append('file', data, { knownLength: data.length, filename });

    const requestConfig = {
      headers: {
        ...AUTH_HEADERS,
        ...formData.getHeaders()
      }
    };

    const response = await axios.post(`https://slack.com/api/files.upload`, formData, requestConfig);

    console.log('Image upload', response.status, JSON.stringify(response.data, null, 2));

    if (response.status < 200 || response.status >= 300 || !response.data.ok) {
      console.log('Failed to upload image: ' + JSON.stringify(response.data, null, 2));
      throw response.data;
    }

    return response.data;
  }

  async getUserIdsInGroup(groupId: string): Promise<string[]> {
    const response = await axios.get(`https://slack.com/api/usergroups.users.list`, {
      params: {
        usergroup: groupId
      },
      headers: AUTH_HEADERS,
    });

    if (response.status < 200 || response.status >= 300 || !response.data.ok) {
      console.log('Failed to upload image: ' + JSON.stringify(response.data, null, 2));
      throw response.data;
    }

    return response.data.users;
  }
}

export const slackApi = new SlackApi();
