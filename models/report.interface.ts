export interface Report {
  name: string;
  description: string;
  impact: string;
  affectedPeople: string;
  url: string;
  time: string;
  stepsToReproduce: string;
  //screenshot;
  currentUser: string;
  isMasquerading: boolean;
  consoleErrors: string;
}
