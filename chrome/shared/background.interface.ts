import { State } from './state.interface';

export interface Background {
  subscribeToState(onChange: (state: State) => void): () => void;
  getLoggedInUserName(): Promise<string>;
}
