import { Command } from 'commander';
import { Logger } from 'winston';
import { logger } from '../logger.js';
import { addCommandType } from './types.js';
import { runPipeline } from './runPipeline.js';

export const addRunCommand: addCommandType = (program: Command, log: Logger = logger) => {
  program
    .command('run')
    .description('Run a pipeline from a config file')
    .argument('<configPath>', 'Path to the pipeline config file')
    .action(async (configPath) => {
      await runPipeline(configPath, log);
    });
};