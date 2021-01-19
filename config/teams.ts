export interface TeamConfig {
  name: string;
  id: string;
  slackChannel: string;
}

export const teams: TeamConfig[] = [
  {
    name: 'Supply',
    id: '10244',
    slackChannel: 'CLEEA2KTJ', // #dev-supply
  },
  {
    name: 'Demand',
    id: '10255',
    slackChannel: 'C01F5F2NXPY', // #demand-team
  },
  {
    name: 'Fulfilment',
    id: '10218',
    slackChannel: 'CFEMLTQ1X', // #dev-x
  },
]

export namespace Teams {
  export function get(teamId: string | number): TeamConfig | null {
    return teams.find(({ id }) => `${teamId}` === id) || null;
  }
}
