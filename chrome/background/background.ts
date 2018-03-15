import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import axios from 'axios';
import { withAuthToken } from './auth';

const _export: {
  background: Background
} & Window = window as any;

class BackgroundHandler {
  private subscriber: any;
  private state: State;

  constructor() {
    this.state = {
      email: null,
      name: null,
      url: null,
      isLoading: true,
      time: null,
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

  public async getInitialState(force?: boolean): Promise<{ email: string, name: string }> {
    const apiResponse = await withAuthToken((token) =>
      axios.get('https://www.googleapis.com/oauth2/v2/userinfo?key=AIzaSyAvrSAsf1qwfysLEAxp_jVRSWlQ2nlAAps', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }));

    console.log(apiResponse);

    const email: string = apiResponse.data.email;
    const name: string = apiResponse.data.name;

    this.updateState({
      ...this.state,
      email,
      name,
      isLoading: false,
    });

    return { email, name };
  }

  public async takeSnapshot(): Promise<void> {
    const url = await this.fetchCurrentUrl();
    const time = new Date().toISOString();

    this.updateState({
      ...this.state,
      url,
      time,
    });
  }

  private fetchCurrentUrl(): Promise<string> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (result) => {
        resolve(result[0].url);
      });
    });
  }

  private updateState(state: State): void {
    this.state = state;
    if (!this.subscriber) {
      return;
    }
    this.subscriber(this.state);
  }
}

const handler = new BackgroundHandler();

_export.background = {
  subscribeToState: handler.subscribe.bind(handler),
  getInitialState: handler.getInitialState.bind(handler),
  takeSnapshot: handler.takeSnapshot.bind(handler),
};
