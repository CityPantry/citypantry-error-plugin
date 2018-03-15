import { ApplicationAction, ApplicationState, StateItem } from '../shared/applicationState.interface'

declare const window: Window & {
  __cp_bug_state__: {
    [index: number]: ApplicationState;
    push(state: any): any;
  },
  __cp_bug_actions__: {
    [index: number]: ApplicationAction;
    push(action: any): any;
  },
};

let currentState: StateItem[] = Array.prototype.slice.call(window.__cp_bug_state__ || []);
let currentActions: any[] = Array.prototype.slice.call(window.__cp_bug_actions__ || []);

window.__cp_bug_state__ = {
  push: state => {
    console.log(state);
  },
};


export class BugActions implements ApplicationAction {
  private actions: any[] = [];

  public push(action: any): any {
    this.actions.push(action);
    console.log(action);
    return action;
  }

  public getLatest() {
    return this.actions.splice(this.actions.length);
  }
};

window.__cp_bug_actions__ = new BugActions();

for (let i = 0; i < currentState.length; i++) {
  window.__cp_bug_state__.push(currentState[i]);
}

for (let i = 0; i < currentActions.length; i++) {
  window.__cp_bug_actions__.push(currentActions[i]);

}
