import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.ENVIRONMENT === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    }),
  ),
  transports: [new transports.Console()],
});

export default logger;
