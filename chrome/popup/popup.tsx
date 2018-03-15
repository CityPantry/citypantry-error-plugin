import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import { PopupBody } from './popup-body';
import { Report } from '../../models';

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

  public submitReport(report: Report): void {
    console.log('Report submitted!', report);
  }

  public render(): JSX.Element {
    return <PopupBody onSubmit={this.submitReport}/>;
  }
}
