import { readFileSync } from 'fs';
import path from 'path';
import { createJsonPipeline } from '@quickbyte/pipelines';
import { Logger } from 'winston';
import { logger } from '../logger.js';

export async function runPipeline(configPath: string, log: Logger = logger, isDryRun = false) {
    try {
      log.info(`Loading pipeline config from ${configPath}`);
      const configContent = readFileSync(path.resolve(configPath), 'utf-8');
      const config = JSON.parse(configContent);

      if (isDryRun) {
        config.writer = {
          type: 'CONSOLE',
          config: {}
        };
      }
  
      log.info('Creating pipeline...');
      const pipeline = await createJsonPipeline(config);
  
      log.info('Running pipeline...');
      await pipeline.run();
  
      log.info('Pipeline completed successfully');
    } catch (error) {
        log.error('Pipeline failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }