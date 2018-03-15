export interface StateItem {
  index: number,
  state: any,
}

export interface ApplicationState {
  push(state: StateItem): void;
}

export interface ApplicationAction {
  push(action: any): void;
}
