<script lang="ts">
  import { Report } from '../../models';
  import { State, SubmitStatus } from '../shared/state.interface';
  import ReportForm from './ReportForm.svelte';

  export let state: State;
  export let takeSnapshot: () => void;
  export let submitReport: (report: Report) => void;
  export let reset: () => void;
  export let openSlack: () => void;
  export let updateForm: (form: Partial<Report>) => void;
</script>

{#if !state.metadata}
  <div
    style="padding: 8px;"
  >Fetching your details...</div>
{:else if !state.snapshot}
  {#if !state.isLoadingSnapshot }
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
          on:click={takeSnapshot}
        >Create a bug report
        </button>
      </div>
      {#if !state.isCityPantryUrl}
        <p class="status-text--red">
          Looks like you're not on a citypantry.com page.<br/>
          Please be careful when creating a bug report to not share sensitive information via the URL or screenshot.
        </p>
      {/if}
    </div>
  {:else}
    <div
      style="padding: 8px; text-align: center"
    >
      <p class="mb-standard">Gathering data...</p>
      <div class="square-spinner"></div>
    </div>;
  {/if}
{:else}
  {#if state.submitStatus === SubmitStatus.INITIAL}
    <ReportForm
      metadata={state.metadata}
      snapshot={state.snapshot}
      form={state.form}
      onSubmit={submitReport}
      onReset={reset}
      onUpdate={updateForm}
    />
  {:else if state.submitStatus === SubmitStatus.PENDING}
    <div
      style="padding: 8px; text-align: center"
    >
      <p class="mb-standard">Submitting...</p>
      <div class="square-spinner"></div>
    </div>
  {:else if state.submitStatus === SubmitStatus.SUCCESS}
    <div style="padding: 8px">
      <h2>Success</h2>
      <p class="mb-standard">Thank you for reporting this.</p>
      <button class="button button--primary" on:click={reset}>Report another bug</button><br />
      <button class="button button--secondary mt-standard" on:click={openSlack}>Open Slack</button>
    </div>
  {:else}
    <div style="padding: 8px">
      <h2>An error occurred</h2>
      <p class="status-text--red mb-standard">Something has gone wrong, please tell the tech team.</p>
      <button class="button button--primary" on:click={openSlack}>Report in Slack</button>
      <button class="button button--secondary ml-standard" on:click={reset}>Try Again</button>
    </div>
  {/if}
{/if}
