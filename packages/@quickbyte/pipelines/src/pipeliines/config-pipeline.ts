import { FlexiblePipeline } from '../pipeline';
import { defaultRegistry, Registry } from '../registry';
import { registerDefaultComponents } from '../factory';
import * as fs from 'fs';
import * as path from 'path';

interface PipelineConfig {
  reader: {
    type: string;
    location: string;
    options?: any;
  };
  transformers: Array<{
    type: string;
    name?: string;
    [key: string]: any;
  }>;
  writer: {
    type: string;
    location: string;
    options?: any;
  };
}

async function createPipelineFromConfig(configPath: string): Promise<FlexiblePipeline> {
  // Read and parse the config file
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config: PipelineConfig = JSON.parse(configContent);

  // Register all available components
  registerDefaultComponents();

  // Create the reader
  const reader = defaultRegistry.createReader(config.reader);

  // Create all transformers
  const transformers = config.transformers.map(transformerConfig => 
    defaultRegistry.createTransformer(transformerConfig)
  );

  // Create the writer
  const writer = defaultRegistry.createWriter(config.writer);

  // Create and return the pipeline
  return new FlexiblePipeline({
    reader,
    transformers,
    writer
  });
}

// Example usage
async function main() {
  try {
    const configPath = path.join(__dirname, '..', '..', 'examples', 'configs', 'api-pipeline.config.json');
    const pipeline = await createPipelineFromConfig(configPath);
    await pipeline.run();
    console.log('Pipeline completed successfully');
  } catch (error) {
    console.error('Pipeline execution failed:', error);
  }
}

// Run the example
main().catch(console.error); 