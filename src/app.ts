import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { AuthHelper } from './middleware/AuthHelper';

const app = express();

useExpressServer(app, {
  controllers: [`${__dirname}/controllers/**`],
  validation: false,
  currentUserChecker: AuthHelper.currentUserChecker,
});

export default app;
