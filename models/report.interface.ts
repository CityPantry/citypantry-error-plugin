import { IncidentSize } from './incident-size.enum';

export interface Report {
  name: string;
  summary: string;
  description: string;
  affectedPeople: string;
  incidentSize: IncidentSize;
  url: string;
  time: string;
  stepsToReproduce: string;
  screenshot: string | null;
  currentUser: string;
  isMasquerading: boolean;
  consoleErrors: string;
}
