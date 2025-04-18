import { ComponentRegistry, ReaderFactory, TransformerFactory, WriterFactory } from './types';

/**
 * A registry for managing component factories (readers, transformers, and writers).
 * This class provides methods to register and create components from configuration.
 * 
 * @class Registry
 * @implements {ComponentRegistry}
 */
export class Registry implements ComponentRegistry {
  /** Map of registered reader factories */
  readers: Record<string, ReaderFactory> = {};
  /** Map of registered transformer factories */
  transformers: Record<string, TransformerFactory> = {};
  /** Map of registered writer factories */
  writers: Record<string, WriterFactory> = {};

  /**
   * Registers a reader factory with the registry
   * @param {string} type - The type identifier for the reader
   * @param {ReaderFactory} factory - The factory function that creates the reader
   */
  registerReader(type: string, factory: ReaderFactory): void {
    this.readers[type] = factory;
  }

  /**
   * Registers a transformer factory with the registry
   * @param {string} type - The type identifier for the transformer
   * @param {TransformerFactory} factory - The factory function that creates the transformer
   */
  registerTransformer(type: string, factory: TransformerFactory): void {
    this.transformers[type] = factory;
  }

  /**
   * Registers a writer factory with the registry
   * @param {string} type - The type identifier for the writer
   * @param {WriterFactory} factory - The factory function that creates the writer
   */
  registerWriter(type: string, factory: WriterFactory): void {
    this.writers[type] = factory;
  }

  /**
   * Creates a reader instance from a configuration
   * @param {any} config - The configuration for the reader
   * @returns {Reader} The created reader instance
   * @throws {Error} If the reader type is not registered
   */
  createReader(config: any) {
    const type = config.type;
    if (!this.readers[type]) {
      throw new Error(`Unknown reader type: ${type}`);
    }
    return this.readers[type](config);
  }

  /**
   * Creates a transformer instance from a configuration
   * @param {any} config - The configuration for the transformer
   * @returns {Transformer} The created transformer instance
   * @throws {Error} If the transformer type is not registered
   */
  createTransformer(config: any) {
    const type = config.type;
    if (!this.transformers[type]) {
      throw new Error(`Unknown transformer type: ${type}`);
    }
    return this.transformers[type](config);
  }

  /**
   * Creates a writer instance from a configuration
   * @param {any} config - The configuration for the writer
   * @returns {Writer} The created writer instance
   * @throws {Error} If the writer type is not registered
   */
  createWriter(config: any) {
    const type = config.type;
    if (!this.writers[type]) {
      throw new Error(`Unknown writer type: ${type}`);
    }
    return this.writers[type](config);
  }
}

/**
 * The default registry instance that can be used throughout the application
 */
export const defaultRegistry = new Registry(); 