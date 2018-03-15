import * as React from 'preact';
import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';
import { PopupBody } from './popup-body';

export interface PopupState {
}

const getBackground = (): Background => (chrome.extension.getBackgroundPage() as any).background;

export class Popup extends React.Component<any, PopupState> implements React.ComponentLifecycle<any, any> {

  private unsubscribe: () => void;

  constructor() {
    super();

    this.state = {};
  }

  public componentDidMount(): void {
    this.unsubscribe = getBackground().subscribeToState((state: State) => {
      this.setState(() => ({}));
    });
  }

  public componentWillUnmount(): void {
    this.unsubscribe();
  }

  public render(): JSX.Element {
    return <PopupBody />;
  }
}
