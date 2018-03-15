import * as slack from './slack-report';
import { HandlerWrapper } from 'serverless-api-handlers';

export function getHandlers(wrapper: HandlerWrapper) {
  return {
    hello: wrapper.wrap(slack.hello),
  }
}
