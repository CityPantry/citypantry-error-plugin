import { Urgency } from './urgency.enum';

export interface Report {
  name: string;
  summary: string;
  description: string;
  affectedPeople: string;
  url: string;
  time: string;
  stepsToReproduce: string;
  screenshot: string | null;
  currentUser: string;
  isMasquerading: boolean;
  consoleErrors: string;
  urgency: Urgency;
}
