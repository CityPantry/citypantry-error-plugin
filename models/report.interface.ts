import { Urgency } from './urgency.enum';

export interface Report {
  name: string;
  description: string;
  impact: string;
  affectedPeople: string;
  url: string;
  time: string;
  stepsToReproduce: string;
  screenshot: string;
  currentUser: string;
  isMasquerading: boolean;
  consoleErrors: string;
  urgency: Urgency;
}
