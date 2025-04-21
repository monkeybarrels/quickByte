import { Command } from 'commander';
import { Logger } from 'winston';
import { logger } from '../logger.js';
import { addCommandType } from './types.js';

export const addDefineCommand: addCommandType = (program: Command, log: Logger = logger) => {
  program
    .command('define')
    .description('Define a new pipeline')
    .action(() => {
      log.info('Defining a new pipeline...');
      // Implementation here
    });
};