import { ComponentRegistry, ReaderFactory, TransformerFactory, WriterFactory } from './types';

/**
 * ComponentRegistry - A registry for reader, transformer, and writer factories
 */
export class Registry implements ComponentRegistry {
  readers: Record<string, ReaderFactory> = {};
  transformers: Record<string, TransformerFactory> = {};
  writers: Record<string, WriterFactory> = {};

  /**
   * Register a reader factory
   */
  registerReader(type: string, factory: ReaderFactory): void {
    this.readers[type] = factory;
  }

  /**
   * Register a transformer factory
   */
  registerTransformer(type: string, factory: TransformerFactory): void {
    this.transformers[type] = factory;
  }

  /**
   * Register a writer factory
   */
  registerWriter(type: string, factory: WriterFactory): void {
    this.writers[type] = factory;
  }

  /**
   * Create a reader from a configuration
   */
  createReader(config: any) {
    const type = config.type;
    if (!this.readers[type]) {
      throw new Error(`Unknown reader type: ${type}`);
    }
    return this.readers[type](config);
  }

  /**
   * Create a transformer from a configuration
   */
  createTransformer(config: any) {
    const type = config.type;
    if (!this.transformers[type]) {
      throw new Error(`Unknown transformer type: ${type}`);
    }
    return this.transformers[type](config);
  }

  /**
   * Create a writer from a configuration
   */
  createWriter(config: any) {
    const type = config.type;
    if (!this.writers[type]) {
      throw new Error(`Unknown writer type: ${type}`);
    }
    return this.writers[type](config);
  }
}

// Create a default registry instance
export const defaultRegistry = new Registry(); 