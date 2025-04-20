import { ReaderFactory, TransformerFactory, WriterFactory } from './types';
import { defaultRegistry } from './registry';
import { ReaderSchemas } from './readers/schema';
import { WriterSchemas } from './writers/schema';
import { TransformerSchemas } from './transformers/schemas';

// Export pipeline
export * from './pipeline';

// Export types
export * from './types';

// Export components
export * from './readers';
export * from './transformers';
export * from './writers';

// Export factory
export * from './factory';

// Export config pipeline
export * from './pipelines/config-pipeline';

// Export json pipeline
export { createPipeline as createJsonPipeline } from './pipelines/json-pipeline';

// Export registry
export { defaultRegistry } from './registry';

// Export schemas
export { ReaderSchemas, WriterSchemas, TransformerSchemas };

// Register default components
import { registerDefaultComponents } from './factory';
registerDefaultComponents();

/**
 * Register a custom reader factory
 * @param type The type identifier for the reader
 * @param factory The factory function that creates the reader
 * @example
 * ```typescript
 * import { registry } from '@quickbyte/pipelines';
 * 
 * registry.registerReader('custom', (config) => ({
 *   read: async () => {
 *     // Custom reader implementation
 *     return ['data'];
 *   }
 * }));
 * ```
 */
export function registerReader(type: string, factory: ReaderFactory): void {
  defaultRegistry.registerReader(type, factory);
}

/**
 * Register a custom transformer factory
 * @param type The type identifier for the transformer
 * @param factory The factory function that creates the transformer
 * @example
 * ```typescript
 * import { registry } from '@quickbyte/pipelines';
 * 
 * registry.registerTransformer('custom', (config) => ({
 *   transform: async (data) => {
 *     // Custom transformer implementation
 *     return data.map(item => `transformed_${item}`);
 *   }
 * }));
 * ```
 */
export function registerTransformer(type: string, factory: TransformerFactory): void {
  defaultRegistry.registerTransformer(type, factory);
}

/**
 * Register a custom writer factory
 * @param type The type identifier for the writer
 * @param factory The factory function that creates the writer
 * @example
 * ```typescript
 * import { registry } from '@quickbyte/pipelines';
 * 
 * registry.registerWriter('custom', (config) => ({
 *   write: async (data) => {
 *     // Custom writer implementation
 *     console.log(data);
 *   }
 * }));
 * ```
 */
export function registerWriter(type: string, factory: WriterFactory): void {
  defaultRegistry.registerWriter(type, factory);
} 