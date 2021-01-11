import { APIGatewayProxyHandler } from 'aws-lambda';
import { JiraIssueEvent } from '@models';

export const main: APIGatewayProxyHandler = async (apiEvent) => {
  const event: JiraIssueEvent = JSON.parse(apiEvent.body);

  // console.log('Webhook event: ', JSON.stringify(event.changelog, null, 2));

  let isCreateEvent = isCreate(event);
  if (isCreateEvent && !!event.issue.fields.customfield_10922 ||
    event.changelog.items.some((item) => item.fieldId === 'customfield_10922')
  ) {
    // const previousValue = isCreateEvent ? null : event.changelog.items.find((item) => item.fieldId === 'customfield_10922').from as string | null;
    // const newValue = event.issue.fields.customfield_10922;
    // console.log('Dev Team Updated', previousValue, newValue);
  } else {
    // console.log('No changes', JSON.stringify(event));
  }

  return {
    statusCode: 201,
    body: '',
  };
}

function isCreate(event: JiraIssueEvent): boolean {
  return event.webhookEvent === 'jira:issue_created';
}
/*
    {
      "field": "Dev Team",
      "fieldtype": "custom",
      "fieldId": "customfield_10922",
      "from": "[10244]",
      "fromString": "Supply",
      "to": "[10218, 10244]",
      "toString": "Fulfilment,Supply"
    }
*/
