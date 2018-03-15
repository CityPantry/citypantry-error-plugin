import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import { PopupBody } from './popup-body';
import { Report } from '../../models';
import axios from 'axios';
import  * as moment from 'moment';

export interface PopupState {
  isLoading: boolean;
  name: string | null;
  email: string | null;
}

const getBackground = (): Background => (chrome.extension.getBackgroundPage() as any).background;

export class Popup extends React.Component<any, PopupState> implements React.ComponentLifecycle<any, any> {

  private unsubscribe: () => void;

  constructor() {
    super();

    this.state = {
      isLoading: true,
      name: null,
      email: null
    };
    this.submitReport = this.submitReport.bind(this);
  }

  public componentDidMount(): void {
    const background = getBackground();
    this.unsubscribe = background.subscribeToState((state: State) => {
      this.setState((oldState) => ({
        ...oldState,
        isLoading: !state.name,
        email: state.email,
        name: state.name
      }));
    });
    background.getLoggedInUserDetails();
  }

  public componentWillUnmount(): void {
    this.unsubscribe();
  }

  public async submitReport(report: Report): Promise<void> {
    console.log('Report submitted!', report);

    await axios.post('https://ingfo0ccaa.execute-api.eu-west-2.amazonaws.com/dev/report', report);
  }

  public render(): JSX.Element {
    return this.state.isLoading ?
      <div>
        Fetching your user details...

      </div> :
      <PopupBody
        name={this.state.name}
        email={this.state.email}
        onSubmit={this.submitReport}
      />;
  }
}
