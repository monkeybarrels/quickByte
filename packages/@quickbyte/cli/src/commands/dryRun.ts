import { Command } from "commander";
import { addCommandType } from "./types.js";
import { logger } from "../logger.js";
import { Logger } from "winston";
import { readFileSync } from 'fs';
import path from 'path';
import { createJsonPipeline } from '@quickbyte/pipelines';
import { runPipeline } from './runPipeline.js';

export const addDryRunCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .command('dry-run')
    .description('Dry run a pipeline from a JSON config')
    .argument('<configPath>', 'Path to the pipeline config file')
    .action(async (configPath) => {
      await runPipeline(configPath, log, true);
    });
}


