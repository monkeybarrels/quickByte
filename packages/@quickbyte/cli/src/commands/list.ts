import { Command } from 'commander';
import { Logger } from 'winston';
import { logger } from '../logger.js';
import { addCommandType } from './types.js';
import { defaultRegistry } from '@quickbyte/pipelines';

export const addListCommand: addCommandType = (program: Command, log: Logger = logger) => {
  program
    .command('list')
    .description('List all registered component types')
    .action(() => {
      log.info('Available component types:');
      log.info('\nReaders:');
      Object.keys(defaultRegistry.readers).forEach((type: string) => log.info(`  - ${type}`));
      log.info('\nTransformers:');
      Object.keys(defaultRegistry.transformers).forEach((type: string) => log.info(`  - ${type}`));
      log.info('\nWriters:');
      Object.keys(defaultRegistry.writers).forEach((type: string) => log.info(`  - ${type}`));
    });
};