import { addCommandType } from "./types";
import { Command } from "commander";
import { runPipeline } from "./runPipeline";
import { Logger } from 'winston';
import { logger } from "../logger";


export const addRunCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .command('run')
    .description('Run a pipeline from a config file')
    .argument('<configPath>', 'Path to the pipeline config file')
    .action(runPipeline);
}