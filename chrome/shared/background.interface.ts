import { State } from './state.interface';

export interface Background {
  subscribeToState(onChange: (state: State) => void): () => void;
  getLoggedInUserDetails(force?: boolean): Promise<string>;
}
