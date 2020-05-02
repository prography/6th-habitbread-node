import express from 'express';
import { useExpressServer } from 'routing-controllers';

const app = express();

useExpressServer(app, {
  controllers: [`${__dirname}/controllers/**`],
});

export default app;
