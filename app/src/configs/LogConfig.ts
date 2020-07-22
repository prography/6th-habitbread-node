import winston from 'winston';
import 'winston-daily-rotate-file';
import env from './index';

const dailyErrorFileTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/error/',
  filename: '%DATE%-error.log',
  level: 'error',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  handleExceptions: true,
});

const dailyInfoFileTransport = new winston.transports.DailyRotateFile({
  dirname: './logs/info/',
  filename: '%DATE%-info.log',
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  handleExceptions: true,
});

const consoleTransport = new winston.transports.Console({
  level: env.NODE_ENV === 'prod' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (stack) return `${level} ${message}`;
      return `${level}: ${message}`;
    })
  ),
  handleExceptions: true,
});

const logger = winston.createLogger({
  format: winston.format.errors({ stack: true }),
  transports: [consoleTransport, dailyErrorFileTransport, dailyInfoFileTransport],
  exitOnError: false,
});

export default logger;
