import { Command } from "commander";
import * as fs from 'fs';
import path from 'path';
import { addCommandType } from "./types";

export const addScaffoldCommand: addCommandType = (program: Command): void => {
    program
        .command('init')
        .description('Scaffold a starter pipeline config')
        .option('-o, --out <path>', 'Output path', 'pipeline.json')
        .action(({ out }) => {
            const template = {
                reader: { type: 'CSV', config: { path: './input.csv' } },
                transformers: [
                    { type: 'MAP', config: { mappings: { id: 'userId' } } }
                ],
                writer: { type: 'CONSOLE', config: {} }
            };

            const outPath = path.resolve(out);
            fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
            console.log(`✅ Pipeline scaffold created at ${outPath}`);
        });

}