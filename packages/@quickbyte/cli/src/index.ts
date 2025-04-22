#!/usr/bin/env node

import { Command } from "commander";
import {
  addDefineCommand,
  addRunCommand,
  addDryRunCommand,
  addValidateCommand,
  addListCommand,
  addScaffoldCommand,
  addScaffoldComponentCommand
} from './commands/index.js';

const program = new Command();

// Add version support
program
  .name('qb')
  .version('0.1.1')
  .description('QuickByte CLI tool for data transformation and pipeline management');

addDefineCommand(program);
addRunCommand(program);
addDryRunCommand(program);
addValidateCommand(program);
addListCommand(program);
addScaffoldCommand(program);
addScaffoldComponentCommand(program);

program.parse(); 