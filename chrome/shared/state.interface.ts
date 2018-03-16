export interface Metadata {
  name: string;
  email: string;
}

export interface Snapshot {
  url: string;
  time: string;
  screenshot: string;
  debugData: string;
  currentUser: UserSnapshot | null;
  isMasquerading: boolean;
}

export interface UserSnapshot {
  type: 'user' | 'customer' | 'vendor';
  name: string;
}

export interface State {
  metadata: Metadata | null;
  isLoadingSnapshot: boolean;
  snapshot: Snapshot | null;
  isValidPage: boolean;
}

export const EMPTY_STATE: State = {
  metadata: null,
  isLoadingSnapshot: false,
  snapshot: null,
  isValidPage: false,
};
Object.freeze(EMPTY_STATE);
