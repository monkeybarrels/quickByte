// Flexible pipeline types

// Generic data type - can be anything
export type Data = any;

/**
 * Interface for reading data from a source
 * @interface Reader
 * @template T - The type of data being read
 */
export interface Reader<T = Data> {
  /**
   * Reads data from the source
   * @returns {Promise<T[]>} A promise that resolves to an array of data items
   */
  read(): Promise<T[]>;
  
  /**
   * Optional method to connect to the data source
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  connect?(): Promise<void>;
  
  /**
   * Optional method to disconnect from the data source
   * @returns {Promise<void>} A promise that resolves when the disconnection is complete
   */
  disconnect?(): Promise<void>;
}

/**
 * Interface for transforming data
 * @interface Transformer
 * @template T - The type of data being transformed
 */
export interface Transformer<T = Data, U = Data> {
  /**
   * Transforms the input data
   * @param {T[]} data - The data to transform
   * @returns {Promise<T[]>} A promise that resolves to the transformed data
   */
  transform(data: T[]): Promise<U[]>;
}

/**
 * Interface for writing data to a destination
 * @interface Writer
 * @template T - The type of data being written
 */
export interface Writer<T = Data> {
  /**
   * Writes data to the destination
   * @param {T[]} data - The data to write
   * @returns {Promise<void>} A promise that resolves when the write is complete
   */
  write(data: T[]): Promise<void>;
  
  /**
   * Optional method to connect to the destination
   * @returns {Promise<void>} A promise that resolves when the connection is established
   */
  connect?(): Promise<void>;
  
  /**
   * Optional method to disconnect from the destination
   * @returns {Promise<void>} A promise that resolves when the disconnection is complete
   */
  disconnect?(): Promise<void>;
}

/**
 * Configuration for a flexible pipeline
 * @interface FlexiblePipelineConfig
 * @template T - The type of data flowing through the pipeline
 */
export interface FlexiblePipelineConfig<T = Data> {
  /** The reader component for the pipeline */
  reader: Reader<T>;
  /** Optional array of transformers to apply to the data */
  transformers?: Transformer<T>[];
  /** The writer component for the pipeline */
  writer: Writer<T>;
}

// Configuration types for creating components from config
export interface ReaderConfig {
  type: string;
  location: string;
  options?: Record<string, any>;
}

export interface TransformerConfig {
  type: string;
  name?: string;
  [key: string]: any;
}

export interface WriterConfig {
  type: string;
  location: string;
  options?: Record<string, any>;
}

export interface CsvWriterConfig {
  location: string;
  options: {
    columns?: string[];
    headers?: boolean;
    [key: string]: any;
  };
}

/**
 * Configuration for creating a pipeline from a registry
 * @interface PipelineConfig
 */
export interface PipelineConfig {
  /** Configuration for the reader */
  reader: ReaderConfig;
  /** Array of transformer configurations */
  transformers: TransformerConfig[];
  /** Configuration for the writer */
  writer: WriterConfig;
}

// Factory functions for creating components
export type ReaderFactory = (config: ReaderConfig) => Reader;
export type TransformerFactory = (config: TransformerConfig) => Transformer;
export type WriterFactory = (config: WriterConfig) => Writer;

/**
 * Registry for component factories
 * @interface ComponentRegistry
 */
export interface ComponentRegistry {
  /** Map of reader factories by type */
  readers: Record<string, ReaderFactory>;
  /** Map of transformer factories by type */
  transformers: Record<string, TransformerFactory>;
  /** Map of writer factories by type */
  writers: Record<string, WriterFactory>;
} 