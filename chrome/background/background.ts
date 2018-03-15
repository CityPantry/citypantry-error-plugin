import { Background } from '../shared/background.interface';
import { EMPTY_STATE, State } from '../shared/state.interface';
import axios from 'axios';
import { withAuthToken } from './auth';
import { Report } from '../../models';
import Tab = chrome.tabs.Tab;
import { config } from '../../config';

const _export: {
  background: Background
} & Window = window as any;

class BackgroundHandler {
  private subscriber: any;
  private state: State;

  constructor() {
    this.state = EMPTY_STATE;
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
      axios.get('https://www.googleapis.com/oauth2/v2/userinfo?key=' + config.oauthToken, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }));

    console.log(apiResponse);

    const email: string = apiResponse.data.email;
    const name: string = apiResponse.data.name;

    this.updateState({
      ...this.state,
      metadata: {
        email,
        name,
      }
    });

    return { email, name };
  }

  public async takeSnapshot(): Promise<void> {
    this.updateState({
      ...this.state,
      isLoadingSnapshot: true,
      snapshot: null
    });

    const { url, windowId, id: tabId } = await this.fetchCurrentTab();
    const screenshot = await this.takeScreenshot(windowId);
    const time = new Date().toISOString();
    const reduxData = await this.getReduxState(tabId as number);

    this.updateState({
      ...this.state,
      isLoadingSnapshot: false,
      snapshot: {
        url: url || '',
        time,
        screenshot,
        debugData: reduxData || ''
      }
    });
  }

  public async sendReport(report: Report): Promise<void> {
    // TODO error handling
    await axios.post('https://ingfo0ccaa.execute-api.eu-west-2.amazonaws.com/dev/report', report);
  }

  public reset(): void {
    this.updateState({
      ...this.state,
      snapshot: null,
      isLoadingSnapshot: false
    });
  }

  private fetchCurrentTab(): Promise<Tab> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (result) => {
        resolve(result[0]);
      });
    });
  }

  private takeScreenshot(windowId: number): Promise<string> {
    return new Promise((resolve) => {
      chrome.tabs.captureVisibleTab(windowId, { format: 'png'}, (dataUrl) => {
        resolve(dataUrl);
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

  private getReduxState(tabId: number): Promise<string> {
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabId, 'get-redux-state-slice', (response) => {
          resolve(response);
        });
      });
    });
  }
}

function getReduxLogsFromPage(): string {
  console.log((window as any).__cp_bug_events__);
  if (!(window as any).__cp_bug_events__) {
    return '';
  }
  return JSON.stringify((window as any).__cp_bug_events__.slice());
}

const handler = new BackgroundHandler();

_export.background = {
  subscribeToState: handler.subscribe.bind(handler),
  getInitialState: handler.getInitialState.bind(handler),
  takeSnapshot: handler.takeSnapshot.bind(handler),
  sendReport: handler.sendReport.bind(handler),
  reset: handler.reset.bind(handler)
};
