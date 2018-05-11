import { Report } from '../../models';

export interface Metadata {
  name: string;
  email: string;
}

export interface Snapshot {
  lastModified: number;
  url: string;
  time: string;
  screenshot: string;
  debugData: string;
  currentUser: UserSnapshot | null;
  isMasquerading: boolean;
}

export interface UserSnapshot {
  type: 'user' | 'customer' | 'vendor' | 'not_logged_in';
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
  submitStatus: SubmitStatus;
  form: Partial<Report> | null;
}

export const EMPTY_STATE: State = {
  metadata: null,
  isLoadingSnapshot: false,
  snapshot: null,
  isValidPage: false,
  submitStatus: SubmitStatus.INITIAL,
  form: null,
};
Object.freeze(EMPTY_STATE);
