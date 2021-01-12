import { config } from '../../config';
import axios from 'axios';

export interface BasicPostData {
  channel?: string;
  username?: string;
  attachments?: any[];
  url?: string;
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

  async post(props: TextPostData | BlocksPostData): Promise<void> {
    const { channel, username, attachments, url } = props;

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

    await axios(url || `https://hooks.slack.com${config.slackUrl}`, {
      method: 'post',
      data
    });
  }
}

export const slackApi = new SlackApi();
