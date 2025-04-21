import path from 'path';
import fs from 'fs';
import { validatePipelineConfig } from '../validation/validate-pipeline.js';
import { addCommandType } from './types.js';
import { Command } from 'commander';
import { Logger } from 'winston';
import { logger } from '../logger.js';

export const addValidateCommand: addCommandType = (program: Command, log: Logger = logger) => {
    program
    .command('validate')
    .description('Validate a pipeline config without executing it')
    .argument('<configPath>', 'Path to the pipeline config file')
    .action((configPath) => {
      try {
        const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf-8'));
        validatePipelineConfig(config);
        console.log('✅ Config is valid!');
      } catch (err) {
        console.error('❌ Config validation failed:');
        console.error(err instanceof Error ? err.message : err);
        process.exit(1);
      }
    });
}