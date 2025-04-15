// Flexible pipeline types

// Generic data type - can be anything
export type Data = any;

// Reader interface - reads data from a source
export interface Reader<T = Data> {
  read(): Promise<T>;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}

// Transformer interface - transforms data
export interface Transformer<T = Data, U = Data> {
  transform(data: T): Promise<U>;
}

// Writer interface - writes data to a destination
export interface Writer<T = Data> {
  write(data: T): Promise<void>;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}

// Pipeline configuration - more flexible than the original
export interface FlexiblePipelineConfig {
  reader: Reader;
  transformers?: Transformer[];
  writer: Writer;
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

export interface PipelineConfig {
  reader: ReaderConfig;
  transformers: TransformerConfig[];
  writer: WriterConfig;
}

// Factory functions for creating components
export type ReaderFactory = (config: ReaderConfig) => Reader;
export type TransformerFactory = (config: TransformerConfig) => Transformer;
export type WriterFactory = (config: WriterConfig) => Writer;

// Registry for factories
export interface ComponentRegistry {
  readers: Record<string, ReaderFactory>;
  transformers: Record<string, TransformerFactory>;
  writers: Record<string, WriterFactory>;
} 