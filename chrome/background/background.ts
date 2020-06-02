import { Background } from '../shared/background.interface';
import { EMPTY_STATE, State, SubmitStatus, UserSnapshot } from '../shared/state.interface';
import axios from 'axios';
import { withAuthToken } from './auth';
import { Report } from '../../models';
import Tab = chrome.tabs.Tab;
import Cookie = chrome.cookies.Cookie;
import { chromeConfig } from '../../config/config.chrome';

const _export: {
  background: Background
} & Window = window as any;

// Debug
// window['axios'] = axios;

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
      axios.get('https://www.googleapis.com/oauth2/v2/userinfo?key=' + chromeConfig.oauthToken, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }));

    const email: string = apiResponse.data.email;
    const name: string = apiResponse.data.name;

    const { url } = await this.fetchCurrentTab();

    const isCityPantryUrl = this.isCityPantryUrl(url);

    const now = new Date().getTime();
    const expiryCutoff = now - 10 * 60 * 1000;
    const shouldRemoveSnapshot = !this.state.snapshot || this.state.snapshot.lastModified < expiryCutoff;

    this.updateState({
      ...this.state,
      metadata: {
        email,
        name,
      },
      isLoadingSnapshot: false,
      snapshot: shouldRemoveSnapshot ? null : this.state.snapshot,
      form: shouldRemoveSnapshot ? null : this.state.form,
      isCityPantryUrl: isCityPantryUrl,
      submitStatus: SubmitStatus.INITIAL,
    });
  }

  public async takeSnapshot(): Promise<void> {
    this.updateState({
      ...this.state,
      isLoadingSnapshot: true,
      snapshot: null
    });

    const { url, windowId, id: tabId } = await this.fetchCurrentTab();

    const isCityPantryUrl = this.isCityPantryUrl(url);
    const time = this.getTime();
    const timeCreated = new Date().getTime();
    const screenshot = await this.takeScreenshot(windowId);
    const reduxData = isCityPantryUrl ? await this.getReduxState(tabId as number) : '';
    const { currentUser, isMasquerading } = isCityPantryUrl ?
      await this.getCurrentUser(url as string) :
      {
        currentUser: {
          name: this.state.metadata && this.state.metadata.name || '',
          type: 'not_logged_in' as 'not_logged_in',
        },
        isMasquerading: false,
      };

    this.updateState({
      ...this.state,
      isLoadingSnapshot: false,
      snapshot: {
        lastModified: timeCreated,
        url: url || '',
        time,
        screenshot,
        debugData: reduxData || '',
        currentUser,
        isMasquerading,
        isCityPantryUrl,
      },
      form: null,
      isCityPantryUrl
    });
  }

  public async sendReport(report: Report): Promise<void> {
    this.updateState({
      ...this.state,
      submitStatus: SubmitStatus.PENDING,
    });
    try {
      console.info('Submitting report:', report);
      await axios.post('https://ingfo0ccaa.execute-api.eu-west-2.amazonaws.com/dev/report', report);

      this.updateState({
        ...this.state,
        submitStatus: SubmitStatus.SUCCESS,
      });
    } catch (e) {
      this.updateState({
        ...this.state,
        submitStatus: SubmitStatus.FAILURE,
      });
    }
  }

  public reset(): void {
    this.updateState({
      ...this.state,
      snapshot: null,
      form: null,
      isLoadingSnapshot: false,
      submitStatus: SubmitStatus.INITIAL,
    });
  }

  public updateForm(form: Partial<Report>): void {
    this.updateState({
      ...this.state,
      form,
      snapshot: this.state.snapshot && {
        ...this.state.snapshot,
        lastModified: new Date().getTime()
      }
    });
  }

  private isCityPantryUrl(url): boolean {
    const cityPantryUrls = /^https?:\/\/([a-z0-9-]+\.)*(c8y\.tech|citypantry\.com|cptesting\.dev|cpstaging\.dev|citypantry-preview\.com)($|\/)/i;

    return !!url.match(cityPantryUrls);
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
      chrome.tabs.sendMessage(tabId, 'get-cp-debug-data', (response) => {
        resolve(response);
      });
    });
  }

  private async getCurrentUser(url: string): Promise<{ currentUser: UserSnapshot | null, isMasquerading: boolean }> {
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
    const apiUrl = `${protocol}://api.${server}/users/get-authenticated-user`;

    const [
      token,
      userId,
    ] = await Promise.all([
      this.getCookie(host, 'token'),
      this.getCookie(host, 'userId'),
    ]);

    console.log('Got tokens?', token, userId);

    if (!token) {
      return {
        currentUser: {
          name: 'Not logged in',
          type: 'not_logged_in'
        },
        isMasquerading: false
      };
    }

    const headers = {
      'citypantry-authtoken': token,
      'citypantry-userid': userId
    };

    try {
      const response = await axios.get(apiUrl, { headers });

      const name = response.data.user.name;
      const isMasquerading = !!response.data.sudo;
      const type = response.data.customer ? 'customer'
        : response.data.vendor ? 'vendor' :
          'user';

      const fullName = name + (type === 'customer' ? ` (${response.data.customer.companyName ? ('Customer: ' + response.data.customer.companyName) : 'Customer' })`:
          type === 'vendor' ? ` (Vendor)` : ''
      );

      return {
        currentUser: {
          type,
          name: fullName
        },
        isMasquerading
      }
    } catch (e) {
      // Not logged in returns 401
      if (e.response && e.response.status === 401) {
        return {
          currentUser: {
            name: 'Not logged in',
            type: 'not_logged_in'
          },
          isMasquerading: false
        };
      } else {
        return {
          currentUser: null,
          isMasquerading: false
        };
      }
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
  reset: handler.reset.bind(handler),
  updateForm: handler.updateForm.bind(handler),
};
