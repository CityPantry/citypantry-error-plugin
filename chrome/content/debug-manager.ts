import { replaceConsole } from './console-tracking';
import { DebugEvent } from '../shared/debug-event.interface';
import { createDebugEventManager } from './redux-tracking';
import { ConsoleEvent } from '../shared/console-event.interface';
import { XhrEvent } from '../shared/xhr-event.interface';

declare const window: Window & {
  __cp_bug_events__: {
    push(event: DebugEvent): void;
    slice(start?: number, end?: number): void;
  };
  __cp_xhr_events__: XhrEvent[];
  console: ConsoleEvent[];
};

const INIT_MESSAGE = '[CP Error Plugin] Loaded Debug Manager!';

export class DebugManager {

  private log

  public init(): void {
    const currentState: DebugEvent[] = Array.prototype.slice.call(window.__cp_bug_events__ || []);

    const events = createDebugEventManager(currentState);
    window.__cp_bug_events__ = events;

    const log = replaceConsole(INIT_MESSAGE);

    console.info(INIT_MESSAGE);
  }

  public getLog(): string {

    return JSON.stringify({
      redux: events.slice(),
      console: log,
      xhr: window.__cp_xhr_events__
    });
  }
}
