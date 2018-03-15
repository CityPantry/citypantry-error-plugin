import { Background } from '../shared/background.interface';
import { State } from '../shared/state.interface';

const _export: {
  background: Background
} & Window = window as any;

class BackgroundHandler {
  private subscriber: any;
  private state: State;

  constructor() {
    this.state = {};
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
}

const handler = new BackgroundHandler();

_export.background = {
  subscribeToState: handler.subscribe.bind(handler),
};
