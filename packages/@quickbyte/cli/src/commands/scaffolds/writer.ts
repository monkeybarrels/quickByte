// src/commands/scaffold.ts
import fs from 'fs';
import path from 'path';
import { ScaffoldComponent, ScaffoldType } from './types';

const templates = {
  writer: (name: string) => {
    const className = name;
    const upperName = name.toUpperCase();

    return {
      classFile: `import { Writer } from '@quickbyte/pipelines';
import fs from 'fs/promises';

interface ${className}Config {
  path: string;
}

export class ${className} implements Writer<${className}Config> {
  constructor(private config: ${className}Config) {}

  async write(data: any[]): Promise<void> {
    await fs.writeFile(this.config.path, JSON.stringify(data, null, 2));
  }
}`,

      schemaFile: `import { z } from 'zod';

export const ${className}Schema = z.object({
  path: z.string()
});`,

      indexFile: `import { defaultRegistry } from '@quickbyte/pipelines';
import { ${className} } from './${className}';
import { ${className}Schema } from './schemas';

defaultRegistry.registerWriter('${upperName}', (config) => new ${className}(config));
export { ${className} };`
    };
  }
};

export const scaffoldWriter: ScaffoldComponent = (type: ScaffoldType, name: string, outPath: string): void => {
  if (type !== 'writer') throw new Error(`Unsupported type: ${type}`);
  const { classFile, schemaFile, indexFile } = templates[type](name);
  const folder = path.join(outPath, name);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, `${name}.ts`), classFile);
  fs.writeFileSync(path.join(folder, `schemas.ts`), schemaFile);
  fs.writeFileSync(path.join(folder, `index.ts`), indexFile);
  console.log(`✅ ${type} '${name}' scaffolded in ${folder}`);
}
