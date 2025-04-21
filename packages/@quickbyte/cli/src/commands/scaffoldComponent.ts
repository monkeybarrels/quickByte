import { Command } from "commander";
import { addCommandType } from "./types.js";
import { logger } from "../logger.js";
import { Logger } from "winston";
import { scaffold } from "./scaffolds/index.js";

export const addScaffoldComponentCommand: addCommandType = (program: Command, log: Logger = logger): void => {
    program
    .command('scaffold')
    .description('Generate a new transformer component scaffold')
    .argument('<type>', 'Component type (reader, transformer, writer)')
    .argument('<name>', 'Component name')
    .option('-o, --out <path>', 'Output folder', './components')
    .action((type, name, options) => {
      log.info(`Scaffolding ${type} component ${name}...`);
      if (type !== 'transformer') {
        log.error(`❌ Unsupported type: ${type}`);
        process.exit(1);
      }
      scaffold(type, name, options.out);
      log.info(`✅ Component scaffold created at ${options.out}/${name}.ts`);
    });
}