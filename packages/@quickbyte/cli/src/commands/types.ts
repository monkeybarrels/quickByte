import { Command } from "commander";
import { Logger } from "winston";

export type addCommandType = (program: Command, log?: Logger) => void;