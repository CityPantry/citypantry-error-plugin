import { replaceConsole } from './console-tracking';
import { DebugEvent } from '../shared/debug-event.interface';
import { createReduxEventManager } from './redux-tracking';
import { ConsoleEvent } from '../shared/console-event.interface';
import { XhrEvent } from '../shared/xhr-event.interface';
import { interceptXhrEvents } from './xhr-tracking';

declare const window: Window & {
  __cp_bug_events__: { // DO NOT RENAME THIS, IT IS HARDCODED IN THE ANGULAR PROJECT
    push(event: DebugEvent): void;
    slice(start?: number, end?: number): void;
  };
};

const INIT_MESSAGE = '[CP Error Plugin] Loaded Debug Manager!';

export class DebugManager {
  private console: ConsoleEvent[] = [];
  private xhr: XhrEvent[] = [];
  private redux: DebugEvent[] = [];

  public init(): void {
    const currentState: DebugEvent[] = Array.prototype.slice.call(window.__cp_bug_events__ || []);
    const redux = createReduxEventManager(currentState);
    window.__cp_bug_events__ = redux;
    this.redux = redux as DebugEvent[];

    this.console = replaceConsole(INIT_MESSAGE);
    this.xhr = interceptXhrEvents();

    console.info(INIT_MESSAGE);
  }

  public getLog(): string {
    return JSON.stringify({
      redux: this.redux.slice(),
      console: this.console,
      xhr: this.xhr
    });
  }
}
