import { defaultRegistry } from './registry';
import { ApiReader, CsvReader, MongoReader, MemoryReader } from './readers';
import { FieldMappingTransformer, FilterTransformer, MapTransformer, AddFieldTransformer } from './transformers';
import { CsvWriter, MongoWriter, ApiWriter, MemoryWriter } from './writers';

/**
 * Register all components with the default registry
 */
export function registerDefaultComponents(): void {
  // Register readers
  defaultRegistry.registerReader('API', (config) => new ApiReader(config));
  defaultRegistry.registerReader('CSV', (config) => new CsvReader(config));
  defaultRegistry.registerReader('MONGODB', (config) => new MongoReader(config));
  defaultRegistry.registerReader('MEMORY', (config) => new MemoryReader(config));
  
  // Register transformers
  defaultRegistry.registerTransformer('FIELD_MAPPING', (config) => new FieldMappingTransformer(config));
  defaultRegistry.registerTransformer('FILTER', (config) => new FilterTransformer(config));
  defaultRegistry.registerTransformer('MAP', (config) => new MapTransformer(config));
  defaultRegistry.registerTransformer('ADD_FIELD', (config) => new AddFieldTransformer(config));
  
  // Register writers
  defaultRegistry.registerWriter('CSV', (config) => new CsvWriter(config));
  defaultRegistry.registerWriter('MONGODB', (config) => new MongoWriter(config));
  defaultRegistry.registerWriter('API', (config) => new ApiWriter(config));
  defaultRegistry.registerWriter('MEMORY', () => new MemoryWriter());
} 