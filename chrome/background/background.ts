import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import axios from 'axios';
import { getAuthToken } from './auth';

const _export: {
  background: Background
} & Window = window as any;

class BackgroundHandler {
  private subscriber: any;
  private state: State;

  constructor() {
    this.state = {
      authToken: ''
    };
  }

  public subscribe(subscriber: (state: any) => void): () => void {
    this.subscriber = subscriber;

    subscriber(this.state);

    return () => {
      if (this.subscriber === subscriber) {
        this.subscriber = null;
      }
    };
  }

  public async getLoggedInUserName(): Promise<string> {
    const token = await getAuthToken();

    const apiResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo?key=AIzaSyAvrSAsf1qwfysLEAxp_jVRSWlQ2nlAAps', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    console.log(apiResponse);

    return JSON.stringify(apiResponse.data);
  }
}

const handler = new BackgroundHandler();

_export.background = {
  subscribeToState: handler.subscribe.bind(handler),
  getLoggedInUserName: handler.getLoggedInUserName.bind(handler)
};
