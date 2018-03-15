import { State } from './state.interface';
import { Report } from '../../models';

export interface Background {
  subscribeToState(onChange: (state: State) => void): () => void;
  getInitialState(force?: boolean): void;
  takeSnapshot(): void;
  sendReport(report: Report): void;
  reset(): void;
}
