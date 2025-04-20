// src/commands/scaffold.ts
import fs from 'fs';
import path from 'path';
import { ScaffoldComponent, ScaffoldType } from './types';

const templates = {
    transformer: (name: string) => {
        const className = name;
        const upperName = name.toUpperCase();

        return {
            classFile: `import { Transformer, TransformContext } from '@quickbyte/pipelines';

interface ${className}Config {
  field: string;
}

export class ${className} implements Transformer<${className}Config> {
  constructor(private config: ${className}Config) {}

  async transform(input: any, context: TransformContext): Promise<any> {
    // TODO: implement transformation logic
    return input;
  }
}`,

            schemaFile: `import { z } from 'zod';

export const ${className}Schema = z.object({
  field: z.string()
});`,

            indexFile: `import { defaultRegistry } from '@quickbyte/pipelines';
import { ${className} } from './${className}';
import { ${className}Schema } from './schemas';

defaultRegistry.registerTransformer('${upperName}', (config) => new ${className}(config));
export { ${className} };`
        };
    }
};

export const scaffoldTransformer: ScaffoldComponent = (type: ScaffoldType, name: string, outPath: string): void => {
    if (type !== 'transformer') throw new Error(`Unsupported type: ${type}`);
    const { classFile, schemaFile, indexFile } = templates[type](name);
    const folder = path.join(outPath, name);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, `${name}.ts`), classFile);
    fs.writeFileSync(path.join(folder, `schemas.ts`), schemaFile);
    fs.writeFileSync(path.join(folder, `index.ts`), indexFile);
    console.log(`✅ ${type} '${name}' scaffolded in ${folder}`);
}
