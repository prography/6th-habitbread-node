import winston from 'winston';
import 'winston-daily-rotate-file';
import env from './index';

const dailyErrorFileTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/error/',
  filename: '%DATE%-error.log',
  level: 'error',
  handleExceptions: true,
  format: winston.format.json(),
});

const dailyInfoFileTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/info/',
  filename: '%DATE%-info.log',
  level: 'info',
  handleExceptions: true,
  json: false,
});

const consoleTransport = new winston.transports.Console({
  level: env.NODE_ENV === 'prod' ? 'error' : 'debug',
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  handleExceptions: true,
});

const logger = winston.createLogger({
  transports: [consoleTransport, dailyErrorFileTransport, dailyInfoFileTransport],
  exitOnError: false,
});

export default logger;
