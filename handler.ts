import { getHandlers } from './backend/handlers';
import { aws } from 'serverless-api-handlers';

export = {
  ...getHandlers(aws)
};
