import express from 'express';
import { useExpressServer } from 'routing-controllers';

const app = express();

useExpressServer(app, {
  controllers: [`${__dirname}/controllers/**`],
  validation: false,
});

export default app;
