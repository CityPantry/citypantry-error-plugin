export interface StateItem {
  index: number,
  state: any,
}

export interface DebugEvent {
  type: 'state' | 'action';
}

export interface StateEvent extends DebugEvent {
  type: 'state';
  index: number;
  state: any;
}

export interface ActionEvent extends DebugEvent {
  type: 'action';
  action: any;
}
