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

// Factory functions for creating components
export type ReaderFactory = (config: any) => Reader;
export type TransformerFactory = (config: any) => Transformer;
export type WriterFactory = (config: any) => Writer;

// Registry for factories
export interface ComponentRegistry {
  readers: Record<string, ReaderFactory>;
  transformers: Record<string, TransformerFactory>;
  writers: Record<string, WriterFactory>;
} 