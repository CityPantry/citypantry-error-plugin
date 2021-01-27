import { IncidentSize } from './incident-size.enum';

export interface Report {
  name: string;
  email: string;
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
  isTest?: boolean;
}

export function getReportFromBody(body: any): Report {
  if (typeof body === 'object') {
    return body;
  } else {
    try {
      return JSON.parse(body);
    } catch (e) {
      console.log('Failed to JSON parse:', body);
      throw e;
    }
  }
}
