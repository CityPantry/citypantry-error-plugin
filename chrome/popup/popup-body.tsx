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
    <div
      style="padding: 8px;"
    >Fetching your details...</div> :
    !state.snapshot ?
      !state.isLoadingSnapshot ?
      <div
        style="padding: 8px;"
      >
        <h2>Report a Bug</h2>
        <p class="mb-standard">
          Open the tab that has the bug and click the button below to report it:
        </p>
        <div class="mb-standard">
          <button
            class="button button--primary button--fullwidth"
            onClick={takeSnapshot}
            disabled={!state.isValidPage}
          >Create a bug report</button>
        </div>
        {!state.isValidPage ? <p class="status-text--red">
          Looks like you're not on a CityPantry.com page... Go to the problem page and try again.
        </p> : null}
      </div> :
      <div
        style="padding: 8px; text-align: center"
      >
        <p class="mb-standard">Gathering data...</p>
        <div class="square-spinner"></div>
      </div> :
    <Form metadata={state.metadata} snapshot={state.snapshot} onSubmit={submitReport} onReset={reset} />
}
