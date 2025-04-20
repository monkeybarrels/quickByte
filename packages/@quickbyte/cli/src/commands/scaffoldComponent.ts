import { Command } from "commander";
import { addCommandType } from "./types";
import { logger } from "../logger";
import { Logger } from "winston";
import { scaffold } from "./scaffolds";

export const addScaffoldComponentCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .command('scaffold')
    .description('Generate a new transformer component scaffold')
    .argument('<type>', 'Component type (e.g., transformer)')
    .argument('<name>', 'Component name (e.g., MyTransformer)')
    .option('-o, --out <path>', 'Output folder', './components')
    .action((type, name, options) => {
      if (type !== 'transformer') {
        console.error(`❌ Unsupported type: ${type}`);
        process.exit(1);
      }
      scaffold(type, name, options.out);
    });
}