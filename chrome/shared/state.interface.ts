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

export enum SubmitStatus {
  INITIAL = "INITIAL",
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

export interface State {
  metadata: Metadata | null;
  isLoadingSnapshot: boolean;
  snapshot: Snapshot | null;
  isValidPage: boolean;
  submitStatus: SubmitStatus,
}

export const EMPTY_STATE: State = {
  metadata: null,
  isLoadingSnapshot: false,
  snapshot: null,
  isValidPage: false,
  submitStatus: SubmitStatus.INITIAL,
};
Object.freeze(EMPTY_STATE);
