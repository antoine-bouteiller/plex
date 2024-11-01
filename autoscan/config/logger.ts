import { pino } from 'pino';
import pretty from 'pino-pretty';

const isTestEnv = process.env.NODE_ENV === 'test';

export const logger = pino(
  isTestEnv
    ? { level: 'silent' }
    : pretty({
        destination: process.stderr,
        colorize: true,
      }),
);
