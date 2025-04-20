import { Command } from "commander";
import { addCommandType } from "./types";
import { logger } from "../logger";
import { Logger } from "winston";

export const addDefineCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .name('quickbyte')
    .description('CLI tool for running QuickByte data pipelines')
    .version('0.1.0');
}