import { defaultRegistry } from './registry';
import { MemoryWriter, CsvWriter, MongoWriter, ApiWriter } from './writers';
import { WriterFactory, TransformerFactory, PipelineConfig } from './types';
import { FlexiblePipeline } from './pipeline';
import { CsvReader, ApiReader, FileReader, MemoryReader, MongoReader, FileReaderConfig } from './readers';
import { EnrichTransformer, MapTransformer, FilterTransformer, FieldMappingTransformer, AddFieldTransformer } from './transformers';

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

  // Default Readers
  defaultRegistry.registerReader('CSV', (config) => new CsvReader(config));
  defaultRegistry.registerReader('API', (config) => new ApiReader(config));
  defaultRegistry.registerReader('FILE', (config) => new FileReader({
    path: config.location,
    encoding: config.options?.encoding as BufferEncoding,
    parseJson: config.options?.parseJson as boolean
  }));
  defaultRegistry.registerReader('MEMORY', (config) => new MemoryReader(config));
  defaultRegistry.registerReader('MONGO', (config) => new MongoReader(config));

  // Default Writers
  defaultRegistry.registerWriter('MEMORY', (config) => new MemoryWriter());
  defaultRegistry.registerWriter('CSV', (config) => new CsvWriter({
    ...config,
    options: config.options || {}
  }));
  defaultRegistry.registerWriter('MONGO', (config) => new MongoWriter(config));
  defaultRegistry.registerWriter('API', (config) => new ApiWriter(config));

  // Default Transformers
  defaultRegistry.registerTransformer('ENRICH', (config) => EnrichTransformer({
    type: 'http' as const,
    urlTemplate: config.urlTemplate || '',
    headers: config.headers,
    merge: config.merge,
    onError: config.onError,
    fallback: config.fallback
  }));
  defaultRegistry.registerTransformer('MAP', (config) => new MapTransformer(config));
  defaultRegistry.registerTransformer('FILTER', (config) => new FilterTransformer(config));
  defaultRegistry.registerTransformer('FIELD_MAPPING', (config) => new FieldMappingTransformer(config));
  defaultRegistry.registerTransformer('ADD_FIELD', (config) => new AddFieldTransformer(config));
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