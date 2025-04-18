import { defaultRegistry } from './registry';
import { MemoryWriter } from './writers';
import { WriterFactory, TransformerFactory, PipelineConfig } from './types';
import { FlexiblePipeline } from './pipeline';

/**
 * Registers all default components with the default registry.
 * This includes:
 * - Default writers (e.g., MemoryWriter)
 * - Default transformers
 * - Default readers
 * 
 * This function should be called before using the pipeline to ensure
 * all necessary components are available.
 */
export function registerDefaultComponents(): void {
  // Register default writers
  defaultRegistry.registerWriter('MEMORY', (config) => new MemoryWriter());
}

export function registerWriter(type: string, factory: WriterFactory): void {
  defaultRegistry.registerWriter(type, factory);
}

export function registerTransformer(type: string, factory: TransformerFactory): void {
  defaultRegistry.registerTransformer(type, factory);
}

/**
 * Creates a new pipeline from a configuration object.
 * This is a convenience function that:
 * 1. Registers all default components
 * 2. Creates the reader, transformers, and writer from the config
 * 3. Returns a new FlexiblePipeline instance
 * 
 * @param {PipelineConfig} config - The pipeline configuration
 * @returns {Promise<FlexiblePipeline>} A promise that resolves to the created pipeline
 */
export const createPipeline = async (config: PipelineConfig): Promise<FlexiblePipeline> => {
  // Register all available components
  registerDefaultComponents();

  // Create the reader
  const reader = defaultRegistry.createReader(config.reader);

  // Create all transformers
  const transformers = config.transformers.map((transformerConfig: any) => 
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