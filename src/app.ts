import express from 'express';
import fs from 'fs';
import moment from 'moment-timezone';
import morgan from 'morgan';
import { useExpressServer } from 'routing-controllers';
import { AuthHelper } from './middleware/AuthHelper';
const app = express();

useExpressServer(app, {
  controllers: [`${__dirname}/controllers/**`],
  validation: false,
  currentUserChecker: AuthHelper.currentUserChecker,
});

morgan.token('date', (req, res, tz) => {
  return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
});
morgan.format('myformat', ':remote-addr - :remote-user [:date] ":method :url" :status :res[content-length] - :response-time ms');
app.use(
  morgan('myformat', {
    stream: fs.createWriteStream('./logs/access.log', { flags: 'a' }),
  })
);
app.use(morgan('dev'));

export default app;
