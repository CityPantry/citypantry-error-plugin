import * as slack from './slack-report';
import { HandlerWrapper } from 'serverless-api-handlers';

export function getHandlers(wrapper: HandlerWrapper<any>) {
  return {
    slackReport: wrapper.wrap(slack.hello),
  }
}
