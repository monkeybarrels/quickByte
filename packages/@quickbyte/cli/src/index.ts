import { Command } from 'commander';
import {
  addDefineCommand,
  addRunCommand,
  addValidateCommand,
  addListCommand,
  addScaffoldCommand,
  addScaffoldComponentCommand
} from './commands';


const program = new Command();

addDefineCommand(program);
addRunCommand(program);
addValidateCommand(program);
addListCommand(program);
addScaffoldCommand(program);
addScaffoldComponentCommand(program);

program.parse(); 