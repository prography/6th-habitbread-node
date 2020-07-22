import * as Sentry from '@sentry/node';
import logger from '../configs/LogConfig';

export const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};

export const errorService = (err: any) => {
  Sentry.captureException(err);
  logger.error(err);
};
