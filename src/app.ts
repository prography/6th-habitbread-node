import * as Sentry from '@sentry/node';
import express from 'express';
import moment from 'moment-timezone';
import morgan from 'morgan';
import { useExpressServer } from 'routing-controllers';
import env from './configs/index';
import { AuthHelper } from './middleware/AuthHelper';
import { stream } from './services/LogService';
const app = express();

if (env.NODE_ENV === 'prod') {
  // Sentry Setting
  Sentry.init({ dsn: env.SENTRY_DNS });
  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 404 and 500 errors
        if (error.status === 404 || error.status === 500) {
          return true;
        }
        return false;
      },
    }) as express.ErrorRequestHandler
  );
}

useExpressServer(app, {
  controllers: [`${__dirname}/controllers/**`],
  validation: false,
  currentUserChecker: AuthHelper.currentUserChecker,
});

morgan.token('date', () => {
  return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});
morgan.format('myformat', ':remote-addr - :remote-user [:date] ":method :url" :status :res[content-length] - :response-time ms');
app.use(morgan('myformat', { stream }));

export default app;
