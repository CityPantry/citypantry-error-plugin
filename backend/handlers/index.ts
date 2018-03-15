import * as slack from './slack-report';
import { HandlerWrapper } from 'serverless-api-handlers';

export function getHandlers(wrapper: HandlerWrapper) {
  return {
    report: wrapper.wrap(slack.report),
  }
}
