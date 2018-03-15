export interface Metadata {
  name: string;
  email: string;
}

export interface Snapshot {
  url: string;
  time: string;
}

export interface State {
  metadata: Metadata | null;
  isLoadingSnapshot: boolean;
  snapshot: Snapshot | null;
}

export const EMPTY_STATE: State = {
  metadata: null,
  isLoadingSnapshot: false,
  snapshot: null
};
Object.freeze(EMPTY_STATE);
