import { Command } from 'commander';
import {
  addDefineCommand,
  addRunCommand,
  addDryRunCommand,
  addValidateCommand,
  addListCommand,
  addScaffoldCommand,
  addScaffoldComponentCommand
} from './commands';


const program = new Command();

addDefineCommand(program);
addRunCommand(program);
addDryRunCommand(program);
addValidateCommand(program);
addListCommand(program);
addScaffoldCommand(program);
addScaffoldComponentCommand(program);

program.parse(); 