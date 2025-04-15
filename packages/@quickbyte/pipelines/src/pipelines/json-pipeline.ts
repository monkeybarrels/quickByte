import { FlexiblePipeline } from '../pipeline';
import { defaultRegistry, Registry } from '../registry';
import { registerDefaultComponents } from '../factory';
import { PipelineConfig } from '../types';
import * as fs from 'fs';

const createPipeline = async (config: PipelineConfig): Promise<FlexiblePipeline> => {
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
};

export { createPipeline };