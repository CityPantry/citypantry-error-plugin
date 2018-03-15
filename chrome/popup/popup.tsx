import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import { PopupBody } from './popup-body';
import { Report } from '../../models';
import axios from 'axios';
import  * as moment from 'moment';

export interface PopupState {
}

const getBackground = (): Background => (chrome.extension.getBackgroundPage() as any).background;

export class Popup extends React.Component<any, PopupState> implements React.ComponentLifecycle<any, any> {

  private unsubscribe: () => void;

  constructor() {
    super();

    this.state = {};
    this.submitReport = this.submitReport.bind(this);
  }

  public componentDidMount(): void {
    this.unsubscribe = getBackground().subscribeToState((state: State) => {
      this.setState(() => ({}));
    });
  }

  public componentWillUnmount(): void {
    this.unsubscribe();
  }

  public async submitReport(report: Report): Promise<void> {
    console.log('Report submitted!', report);
    await axios.post('https://ingfo0ccaa.execute-api.eu-west-2.amazonaws.com/dev/report', report);
  }

  public render(): JSX.Element {
    return <PopupBody onSubmit={this.submitReport}/>;
  }
}
