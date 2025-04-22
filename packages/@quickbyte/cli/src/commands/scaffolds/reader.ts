// src/commands/scaffold.ts
import * as fs from 'fs';
import * as path from 'path';
import { ScaffoldComponent, ScaffoldType } from './types';


const templates = {
  reader: (name: string) => {
    const className = name;
    const upperName = name.toUpperCase();

    return {
      classFile: `import { Reader } from '@quickbyte/pipelines';

interface ${className}Config {
  path: string;
}

export class ${className} implements Reader<${className}Config> {
  constructor(private config: ${className}Config) {}

  async read(): Promise<any[]> {
    // TODO: implement reading logic
    return [];
  }
}`,

      schemaFile: `import { z } from 'zod';

export const ${className}Schema = z.object({
  path: z.string()
});`,

      indexFile: `import { defaultRegistry } from '@quickbyte/pipelines';
import { ${className} } from './${className}';
import { ${className}Schema } from './schemas';

defaultRegistry.registerReader('${upperName}', (config) => new ${className}(config));
export { ${className} };`
    };
  }
};

export const scaffoldReader: ScaffoldComponent = (type: ScaffoldType, name: string, outPath: string): void => {
  if (type !== 'reader') throw new Error(`Unsupported type: ${type}`);
  const { classFile, schemaFile, indexFile } = templates[type](name);
  const folder = path.join(outPath, name);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, `${name}.ts`), classFile);
  fs.writeFileSync(path.join(folder, `schemas.ts`), schemaFile);
  fs.writeFileSync(path.join(folder, `index.ts`), indexFile);
  console.log(`✅ ${type} '${name}' scaffolded in ${folder}`);
}
