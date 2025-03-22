import { Readable } from 'stream';

// Core types for data sources and formats
export type DataSource = 'file' | 'database' | 'api' | 'stream' | 'mongodb' | 'xml';
export type DataFormat = 'json' | 'csv' | 'xml' | 'yaml' | 'text';

// Configuration types
export interface SourceConfig {
    type: DataSource;
    location: string;
    options?: Record<string, unknown>;
}

export interface FormatConfig {
    type: DataFormat;
    options?: Record<string, unknown>;
}

// Database connection type
export interface DatabaseConnection {
    host: string;
    port: number;
    database: string;
    username?: string;
    password?: string;
    ssl?: boolean;
}

// Reader interfaces
export interface DataReader<T, P = unknown> {
    read(config: SourceConfig, params?: P): Promise<T[]>;
    readStream?(config: SourceConfig, params?: P): Promise<AsyncIterable<T>>;
}

export interface FileReaderConfig {
    path: string;
    encoding?: string;
    delimiter?: string;
}

export interface ApiReaderConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
}

export interface DatabaseReaderConfig {
    table: string;
    connection: DatabaseConnection;
    query?: string;
}

export interface StreamReaderConfig {
    stream: Readable;
    encoding?: string;
}

// Formatter interfaces
export interface DataFormatter<T, R = unknown> {
    format(data: T[], config: FormatConfig): Promise<R>;
    parse(data: R, config: FormatConfig): Promise<T[]>;
}

export interface CsvFormatterConfig {
    headers: string[];
    delimiter?: string;
}

export interface JsonFormatterConfig {
    pretty?: boolean;
}

export interface XmlFormatterConfig {
    rootElement: string;
    itemElement: string;
}

export interface DatabaseFormatterConfig {
    table: string;
    connection: DatabaseConnection;
}

// Service interfaces
export interface DataService<T, P = unknown, R = unknown> {
    reader: DataReader<T, P>;
    formatter: DataFormatter<T, R>;
    read(config: SourceConfig, format: FormatConfig, params?: P): Promise<R>;
    readStream?(config: SourceConfig, format: FormatConfig, params?: P): Promise<AsyncIterable<R>>;
}

// Error handling
export class DataError extends Error {
    constructor(
        message: string,
        public source: DataSource,
        public code: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'DataError';
    }
}

// Utility types
export type DataTransform<T, R> = (data: T) => R;
export type DataFilter<T> = (data: T) => boolean;
export type DataValidator<T> = (data: T) => boolean;

// Service options
export interface DataServiceOptions<T> {
    transform?: DataTransform<T, T>;
    validate?: DataValidator<T>;
    filter?: DataFilter<T>;
}

// MongoDB connection type
export interface MongoConnection {
    uri: string;
    database: string;
    collection: string;
    options?: Record<string, unknown>;
}

export interface MongoReaderConfig {
    connection: MongoConnection;
    query?: Record<string, unknown>;
    options?: Record<string, unknown>;
}