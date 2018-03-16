import * as reportBug from './report';
import { HandlerWrapper } from 'serverless-api-handlers';

export function getHandlers(wrapper: HandlerWrapper) {
  return {
    report: wrapper.wrap(reportBug.report, { cors: true }),
  }
}
