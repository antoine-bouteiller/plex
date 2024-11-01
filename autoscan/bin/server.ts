import { logger } from '#config/logger';
import cron from '#start/cron';
import { loadConfig } from '#start/env';
import webserver from '#start/routes';

global.config = loadConfig();
cron.start();

webserver
  .listen(3030)
  .then((_) => logger.info('Webserver started on port 3030'))
  .catch((_) => logger.error('Failed to start webserver on port 3030'));
