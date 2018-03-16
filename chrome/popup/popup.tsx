import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { EMPTY_STATE, State } from '../shared/state.interface';
import { PopupBody } from './popup-body';
import { Report } from '../../models';
import { config } from '../../config';

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
    this.openSlack = this.openSlack.bind(this);
    this.updateForm = this.updateForm.bind(this);
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

  public updateForm(form: Partial<Report>): void {
    getBackground().updateForm(form);
  }

  public render(): JSX.Element {
    return <PopupBody
      state={this.state}
      takeSnapshot={this.takeSnapshot}
      submitReport={this.submitReport}
      reset={this.reset}
      openSlack={this.openSlack}
      updateForm={this.updateForm}
    />
  }

  public openSlack(): void {
    chrome.tabs.create({ url: `https://slack.com/app_redirect?channel=${config.slackChannelId }` });
  }
}
