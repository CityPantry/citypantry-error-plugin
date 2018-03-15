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
      events = events.slice(0, 40).concat(event);
      console.log(event);
    },
    slice: (): DebugEvent[] => {
      const types = events.map(event => event.type);
      const firstState = types.indexOf('state');
      const lastState = types.lastIndexOf('state');

      return events.filter((event, index) => {
        if (index < firstState || index > lastState) {
          return false;
        }
        if (event.type === 'state' && index > firstState || index < lastState) {
          return false;
        }
        return true;
      })
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

  if (!document.getElementById('cp-bug-content-script')) {
    injectScript( chrome.extension.getURL('/js/content.js'), 'body');
  } else {
    const currentState: DebugEvent[] = Array.prototype.slice.call(window.__cp_bug_events__ || []);

    window.__cp_bug_events__ = createDebugEventManager(currentState) as any; // TODO type
    console.info('Loaded Debug Event Manager!');
  }

})();

