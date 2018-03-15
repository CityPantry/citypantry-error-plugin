import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { EMPTY_STATE, State } from '../shared/state.interface';
import { PopupBody } from './popup-body';
import { Report } from '../../models';

const getBackground = (): Background => (chrome.extension.getBackgroundPage() as any).background;

export class Popup extends React.Component<any, State> implements React.ComponentLifecycle<any, any> {

  private unsubscribe: () => void;

  constructor() {
    super();

    this.state = { ...EMPTY_STATE };
    this.unsubscribe = () => {};
    this.submitReport = this.submitReport.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
    this.reset = this.reset.bind(this);
  }

  public componentDidMount(): void {
    const background = getBackground();
    this.unsubscribe = background.subscribeToState((state: State) => {
      this.setState(() => state);
    });
    background.getInitialState();
  }

  public componentWillUnmount(): void {
    this.unsubscribe();
  }

  public async submitReport(report: Report): Promise<void> {
    console.log('Report submitted!', report);

    getBackground().sendReport(report);
  }

  public takeSnapshot(): void {
    getBackground().takeSnapshot();
  }

  public reset(): void {
    getBackground().reset();
  }

  public render(): JSX.Element {
    return <PopupBody
      state={this.state}
      takeSnapshot={this.takeSnapshot}
      submitReport={this.submitReport}
      reset={this.reset}
    />
  }
}
