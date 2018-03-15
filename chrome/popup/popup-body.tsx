import * as React from 'preact';
import { Report } from '../../models';
import { State } from '../shared/state.interface';
import { Form } from './form';

export interface PopupBodyProps {
  state: State;
  takeSnapshot(): void;
  submitReport(report: Report): void;
  reset(): void;
}

export function PopupBody({ state, takeSnapshot, submitReport, reset }: PopupBodyProps): JSX.Element {
  console.log('Update', state);
  return !state.metadata ?
    <div>Fetching your details...</div> :
    !state.snapshot ?
      !state.isLoadingSnapshot ?
      <div>
        <h1>Report a Bug</h1>
        Open the tab that has the bug and click the button below to report it:
        <div>
          <button onClick={takeSnapshot}>I'm on the right tab</button>
        </div>
      </div> :
      <div>Taking snapshot...</div> :
    <Form metadata={state.metadata} snapshot={state.snapshot} onSubmit={submitReport} onReset={reset} />
}
