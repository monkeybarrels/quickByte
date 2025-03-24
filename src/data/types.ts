import { Readable } from 'stream';

// Core types for data sources and formats
export enum DataSource {
    FILE = 'file',
    DATABASE = 'database',
    API = 'api',
    STREAM = 'stream',
    MONGODB = 'mongodb',
    XML = 'xml'
}

export enum DataFormat {
    JSON = 'json',
    CSV = 'csv',
    XML = 'xml',
    YAML = 'yaml',
    TEXT = 'text',
    MONGODB = 'mongodb'
}

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
    format: DataFormat;
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
        public source: DataSource | DataFormat,
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

/**
 * Types of transformers available in the system
 */
export enum TransformerType {
    SIMPLE = 'simple',
    BATCH = 'batch',
    TYPE_CONVERT = 'type_convert',
    COMPLEX = 'complex',
    ERROR = 'error',
    FIELD_MAPPING = 'field_mapping',
    FILTER = 'filter',
    MAP = 'map'
}

/**
 * Interface for data transformers that can modify data during the ETL process
 */
export interface DataTransformer<T, R> {
    /**
     * The type of transformer
     */
    type: TransformerType;

    /**
     * Transforms the input data into a new format
     * @param data - The input data to transform
     * @returns The transformed data
     */
    transform(data: T): R;

    /**
     * Transforms an array of input data
     * @param data - Array of input data to transform
     * @returns Array of transformed data
     */
    transformBatch(data: T[]): R[];
}

/**
 * Configuration for a transformer
 */
export interface TransformerConfig {
    /** Optional name for the transformer */
    name?: string;
    /** Optional description of what the transformer does */
    description?: string;
}

/**
 * Configuration for a field mapping transformer
 */
export interface FieldMappingConfig extends TransformerConfig {
    /** Map of field names from source to target */
    fieldMap: Record<string, string>;
    /** Whether to drop fields not specified in the fieldMap */
    dropUnmapped?: boolean;
}

/**
 * Types of filter operators available
 */
export enum FilterOperator {
    EQUALS = 'eq',
    NOT_EQUALS = 'neq',
    GREATER_THAN = 'gt',
    LESS_THAN = 'lt',
    GREATER_THAN_EQUALS = 'gte',
    LESS_THAN_EQUALS = 'lte',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith'
}

/**
 * Configuration for a filter transformer
 */
export interface FilterConfig<T> extends TransformerConfig {
    /** Function to determine if an item should be included */
    predicate: (item: T) => boolean;
    /** Field to filter on */
    field: string;
    /** Operator to use for filtering */
    operator: FilterOperator;
    /** Value to compare against */
    value: string | number | boolean;
}

/**
 * Types of map operations available
 */
export enum MapOperation {
    TO_LOWER_CASE = 'toLowerCase',
    TO_UPPER_CASE = 'toUpperCase',
    TRIM = 'trim',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    STRING = 'string'
}

/**
 * Configuration for a map transformer
 */
export interface MapConfig<T, R> extends TransformerConfig {
    /** Function to transform each item */
    transform: (item: T) => R;
    /** Field to transform */
    field: string;
    /** Operation to apply */
    operation: MapOperation;
}

export interface DataWriter<T> {
    write(data: T[], config: WriterConfig): Promise<void>;
    writeStream?(data: AsyncIterable<T>, config: WriterConfig): Promise<void>;
}

export interface WriterConfig {
    type: DataSource;
    options?: Record<string, unknown>;
}

export type DynamicTransformerConfigUnion = FieldMappingConfig | FilterConfig<any> | MapConfig<any, any>;