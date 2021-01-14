export interface TeamConfig {
  name: string;
  id: string;
  slackChannel: string;
}

const teams: TeamConfig[] = [
  {
    name: 'Supply',
    id: '10244',
    slackChannel: 'CLEEA2KTJ', // #dev-supply
  },
  {
    name: 'Demand',
    id: '10255',
    slackChannel: '#slack-test',
  },
  {
    name: 'Fulfilment',
    id: '10218',
    slackChannel: '#slack-test',
  },
]

export namespace Teams {
  export function get(teamId: string | number): TeamConfig | null {
    return teams.find(({ id }) => `${teamId}` === id) || null;
  }
}
