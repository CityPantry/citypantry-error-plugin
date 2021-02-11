<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Background } from '../shared/background.interface';
  import { EMPTY_STATE, State } from '../shared/state.interface';
  import PopupBody from './PopupBody.svelte';
  import { Report } from '../../models';
  import { chromeConfig } from '../../config/config.chrome';

  const getBackground = (): Background => (chrome?.extension?.getBackgroundPage() as any)?.background || {
    callback: null as (state: State) => void,
    getInitialState: function() {
      setTimeout(() => {
        if (this.callback) {
          this.callback({ metadata: { email: 'user', name: 'Hello' } } as State)
        }
      }, 1000)
    },
    reset: () => {},
    sendReport: () => {},
    subscribeToState: function(callback) { this.callback = callback },
    takeSnapshot: () => {
      console.log('TAKE SNAPSHOT');
    },
    updateForm: () => {},
  };

  let unsubscribe: () => void = () => {};

  let state = { ...EMPTY_STATE };

  onMount(() => {
    const background = getBackground();
    unsubscribe = background.subscribeToState((newState: State) => {
      state = newState;
    });

    background.getInitialState();
  })

  onDestroy(() => {
    unsubscribe();
  });

  async function submitReport(report: Report): Promise<void> {
    console.log('Report submitted!', report);

    getBackground().sendReport(report);
  }

  function takeSnapshot(): void {
    getBackground().takeSnapshot();
  }

  function reset(): void {
    getBackground().reset();
  }

  function updateForm(form: Partial<Report>): void {
    getBackground().updateForm(form);
  }

  function openSlack(): void {
    chrome.tabs.create({ url: `https://slack.com/app_redirect?channel=${chromeConfig.slackChannelId }` });
  }
</script>

<PopupBody
  state={state}
  takeSnapshot={takeSnapshot}
  submitReport={submitReport}
  reset={reset}
  openSlack={openSlack}
  updateForm={updateForm}
/>
