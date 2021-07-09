import * as React from 'preact';
import { Report } from '../../models';
import { State, SubmitStatus } from '../shared/state.interface';
import { Form } from './form';

export interface PopupBodyProps {
  state: State;
  takeSnapshot(): void;
  submitReport(report: Report): void;
  reset(): void;
  openSlack(): void;
  updateForm(form: Partial<Report>): void;
}

export function PopupBody({ state, takeSnapshot, submitReport, reset, openSlack, updateForm }: PopupBodyProps): JSX.Element {
  console.log('Update', state);
  if (!state.metadata) {
    return <div
      style="padding: 8px;"
    >Fetching your details...</div>;
  }

  if (!state.snapshot) {
    if (!state.isLoadingSnapshot) {
      return <div
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
          >Create a bug report
          </button>
        </div>
        {!state.isCityPantryUrl ? <p class="status-text--red">
          Looks like you're not on a Just Eat for Business page.<br/>
          Please be careful when creating a bug report to not share sensitive information via the URL or screenshot.
        </p> : null}
      </div>;
    } else {
      return <div
        style="padding: 8px; text-align: center"
      >
        <p class="mb-standard">Gathering data...</p>
        <div class="square-spinner"></div>
      </div>;
    }
  }

  if (state.submitStatus === SubmitStatus.INITIAL) {
    return <Form
      metadata={state.metadata}
      snapshot={state.snapshot}
      form={state.form}
      onSubmit={submitReport}
      onReset={reset}
      onUpdate={updateForm}
    />;
  }

  if (state.submitStatus === SubmitStatus.PENDING) {
    return <div
    style="padding: 8px; text-align: center"
      >
      <p class="mb-standard">Submitting...</p>
    <div class="square-spinner"></div>
  </div>;
  }

  return state.submitStatus === SubmitStatus.SUCCESS ?
    <div style={{padding: "8px"}}>
      <h2>Success</h2>
      <p class="mb-standard">Thank you for reporting this.</p>
      <button class="button button--primary" onClick={reset}>Report another bug</button><br />
      <button class="button button--secondary mt-standard" onClick={openSlack}>Open Slack</button>
    </div>
    :
    <div style={{padding: "8px"}}>
      <h2>An error occurred</h2>
      <p class="status-text--red mb-standard">Something has gone wrong, please tell the tech team.</p>
      <button class="button button--primary" onClick={openSlack}>Report in Slack</button>
      <button class="button button--secondary ml-standard" onClick={reset}>Try Again</button>
    </div>;
}
