import { DebugEvent } from '../shared/debug-event.interface';

declare const window: Window & {
  __cp_bug_events__: {
    push(event: DebugEvent): void;
    slice(start?: number, end?: number): void;
  }
};

export function createDebugEventManager(initialEvents: DebugEvent[]) {
  let events = initialEvents || [];

  return {
    push: (event: DebugEvent): void => {
      events = events.slice(-40).concat(event);
    },
    slice: (): DebugEvent[] => {
      const types = events.map(event => event.type);
      const firstState = types.indexOf('state');
      let lastState = types.lastIndexOf('state');
      if (lastState === types.length - 1) {
        // Can't work with the last state because we don't know what action caused it, although this should not happen
        lastState = types.lastIndexOf('state', lastState - 1);
      }

      const returnList: DebugEvent[] = [];

      let i = firstState;
      while (i <= lastState) {
        const state = events[i];
        const action = events[i + 1];

        if (i === firstState) {
          returnList.push(state);
        } else {
          returnList.push(action);
        }
        if (i === lastState) {
          returnList.push(state);
        }

        i += 2;
      }

      return returnList;
    }
  }
}

(() => {
  function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    s.setAttribute('id', 'cp-bug-content-script');
    th.appendChild(s);
  }

  // If we're in the content script setup, we won't be able to access the window variables.
  // Re-inject ourselves so we can do it properly.
  if (!document.getElementById('cp-bug-content-script')) {
    injectScript( chrome.extension.getURL('/js/content.js'), 'body');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request === 'get-redux-state-slice') {
        window.document.dispatchEvent(new CustomEvent('get-redux-state-slice'));
        const area = window.document.getElementById('__cp-redux-state-slice') as HTMLTextAreaElement;
        const value = area && area.value || '';
        window.document.dispatchEvent(new CustomEvent('cleanup-redux-state-slice'));
        sendResponse(value);
      }
    });
  } else {
    const currentState: DebugEvent[] = Array.prototype.slice.call(window.__cp_bug_events__ || []);

    const manager = createDebugEventManager(currentState);
    window.__cp_bug_events__ = manager;

    window.document.addEventListener('get-redux-state-slice', () => {
      const area = document.createElement('textarea');
      area.style.display = 'none';
      area.id = '__cp-redux-state-slice';
      area.value = JSON.stringify(manager.slice());
      document.body.appendChild(area);
    });
    window.document.addEventListener('cleanup-redux-state-slice', () => {
      const area = document.getElementById('__cp-redux-state-slice') as HTMLTextAreaElement;
      if (area) {
        area.parentElement && area.parentElement.removeChild(area);
      }
    });

    console.info('Loaded Debug Event Manager!');
  }

})();

