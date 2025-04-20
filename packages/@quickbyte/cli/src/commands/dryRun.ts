import { Command } from "commander";
import { addCommandType } from "./types";
import { logger } from "../logger";
import { Logger } from "winston";
import { readFileSync } from 'fs';
import path from 'path';
import { createJsonPipeline } from '@quickbyte/pipelines';

export const addDryRunCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .command('dry-run')
    .description('Dry run a pipeline from a JSON config')
    .argument('<configPath>', 'Path to the pipeline config file')
    .option('--dry-run', 'Execute pipeline without writing output')
    .action(async (configPath, options) => {
      try {
        const config = JSON.parse(readFileSync(path.resolve(configPath), 'utf-8'));
  
        // If dry run, override the writer with a ConsoleWriter
        if (options.dryRun) {
          config.writer = {
            type: 'CONSOLE',
            config: {}
          };
        }
  
        const pipeline = await createJsonPipeline(config);
        await pipeline.run();
      } catch (err) {
        console.error('❌ Failed to run pipeline:', err);
        process.exit(1);
      }
    });
}


