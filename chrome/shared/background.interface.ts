import { State } from './state.interface';

export interface Background {
  subscribeToState(onChange: (state: State) => void): () => void;
  getInitialState(force?: boolean): Promise<string>;
  takeSnapshot(): Promise<void>,
}
