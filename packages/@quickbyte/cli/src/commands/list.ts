import { defaultRegistry } from "@quickbyte/pipelines";
import { logger } from "../logger";
import { addCommandType } from "./types";
import { Command } from "commander";
import { Logger } from "winston";

export const addListCommand: addCommandType = (program: Command, log: Logger = logger) => {
    program
    .command('list')
    .description('List all registered component types')
    .action(() => {
      console.log('📥 Readers:', Object.keys(defaultRegistry.readers));
      console.log('🔄 Transformers:', Object.keys(defaultRegistry.transformers));
      console.log('📤 Writers:', Object.keys(defaultRegistry.writers));
    });
}