import { Background } from '../shared/background.interface';
import { EMPTY_STATE, State } from '../shared/state.interface';
import axios from 'axios';
import { withAuthToken } from './auth';
import { Report } from '../../models';
import Tab = chrome.tabs.Tab;
import Cookie = chrome.cookies.Cookie;
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

  public async getInitialState(force?: boolean): Promise<void> {
    const apiResponse = await withAuthToken((token) =>
      axios.get('https://www.googleapis.com/oauth2/v2/userinfo?key=' + config.oauthToken, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }));

    console.log(apiResponse);

    const email: string = apiResponse.data.email;
    const name: string = apiResponse.data.name;

    const { url } = await this.fetchCurrentTab();

    const isValidUrl = this.isValidUrl(url);

    this.updateState({
      ...this.state,
      metadata: {
        email,
        name,
      },
      isLoadingSnapshot: false,
      snapshot: null,
      isValidPage: isValidUrl
    });
  }

  public async takeSnapshot(): Promise<void> {
    this.updateState({
      ...this.state,
      isLoadingSnapshot: true,
      snapshot: null
    });

    const { url, windowId, id: tabId } = await this.fetchCurrentTab();

    const isValidUrl = this.isValidUrl(url);
    if (!isValidUrl) {
      this.updateState({
        ...this.state,
        isLoadingSnapshot: false,
        snapshot: null,
        isValidPage: false
      });
      return;
    }

    const screenshot = await this.takeScreenshot(windowId);
    const time = this.getTime();
    const reduxData = await this.getReduxState(tabId as number);
    const { currentUser, isMasquerading } = await this.getCurrentUser(url as string);
    console.log(currentUser, isMasquerading);

    this.updateState({
      ...this.state,
      isLoadingSnapshot: false,
      snapshot: {
        url: url || '',
        time,
        screenshot,
        debugData: reduxData || '',
        currentUser,
        isMasquerading
      },
      isValidPage: true
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

  private isValidUrl(url): boolean {
    return !!(url.match(/^https:\/\/citypantry.com\//) || url.match(/^https?:\/\/[^\/]+\.c8y\.tech\//));
  }

  private getTime(): string {
    const now = new Date();
    const pad = x => x < 10 ? '0' + x : '' + x;

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
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
      chrome.tabs.sendMessage(tabId, 'get-redux-state-slice', (response) => {
        resolve(response);
      });
    });
  }

  private async getCurrentUser(url: string): Promise<{ currentUser: {
    name: string;
    type: 'user' | 'customer' | 'vendor'
  } | null, isMasquerading: boolean }> {
    const domainMatch = url.match(/(^(https?):\/\/(?:www\.)?(.*?))\//i);
    if (!domainMatch) {
      console.log('Could not parse URL:', url);
      return {
        currentUser: null,
        isMasquerading: false
      };
    }

    const host = domainMatch[1];
    const protocol = domainMatch[2];
    const server = domainMatch[3];
    const apiUrl = `${protocol}://api.${server}/users/get-authenticated-user`

    const [
      token,
      userId,
      staffMasqueraderToken,
      staffMasqueraderId
    ] = await Promise.all([
      this.getCookie(host, 'token'),
      this.getCookie(host, 'userId'),
      this.getCookie(host, 'staffMasqueraderToken'),
      this.getCookie(host, 'staffMasqueraderId'),
    ]);

    console.log('Got tokens?', token, userId);

    if (!token) {
      return {
        currentUser: null,
        isMasquerading: false
      };
    }

    const headers = {
      'citypantry-authtoken': token,
      'citypantry-userid': userId
    };
    if (staffMasqueraderId && staffMasqueraderToken) {
      headers['citypantry-staffmasqueraderid'] = staffMasqueraderId;
      headers['citypantry-staffmasqueradertoken'] = staffMasqueraderToken;
    }

    const response = await axios.get(apiUrl, { headers });

    console.log(response.data);

    const name = response.data.user.name;
    const isMasquerading = !!response.data.sudo;
    const type = response.data.customer ? 'customer'
      : response.data.vendor ? 'vendor' :
        'user';

    const fullName = name + (type === 'customer' ? ` (Customer: ${response.data.customer.companyName})`:
        type === 'vendor' ? ` (Vendor)` : ''
    );

    return {
      currentUser: {
        type, name: fullName
      },
      isMasquerading
    }
  }

  private async getCookie(url: string, name: string): Promise<string | null> {
    console.log('Getting cookie', name, url);
    const cookie = await new Promise<Cookie | null>((resolve) => {
      chrome.cookies.get({
        url,
        name
      }, resolve);
    });
    return cookie && cookie.value || null;
  }
}

const handler = new BackgroundHandler();

_export.background = {
  subscribeToState: handler.subscribe.bind(handler),
  getInitialState: handler.getInitialState.bind(handler),
  takeSnapshot: handler.takeSnapshot.bind(handler),
  sendReport: handler.sendReport.bind(handler),
  reset: handler.reset.bind(handler)
};
