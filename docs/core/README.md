# Core Concepts

## Data Types

### DataSource
```typescript
type DataSource = 'file' | 'database' | 'api' | 'stream';
```

### DataFormat
```typescript
type DataFormat = 'json' | 'csv' | 'xml' | 'yaml' | 'text';
```

## Configuration Types

### SourceConfig
```typescript
interface SourceConfig {
    type: DataSource;
    location: string;
    options?: Record<string, unknown>;
}
```

### FormatConfig
```typescript
interface FormatConfig {
    type: DataFormat;
    options?: Record<string, unknown>;
}
```

## Core Interfaces

### DataReader
```typescript
interface DataReader<T, P = unknown> {
    read(config: SourceConfig, params?: P): Promise<T[]>;
    readStream?(config: SourceConfig, params?: P): Promise<AsyncIterable<T>>;
}
```

### DataFormatter
```typescript
interface DataFormatter<T, R = unknown> {
    format(data: T[], config: FormatConfig): Promise<R>;
    parse(data: R, config: FormatConfig): Promise<T[]>;
}
```

### DataService
```typescript
interface DataService<T, P = unknown, R = unknown> {
    reader: DataReader<T, P>;
    formatter: DataFormatter<T, R>;
    read(config: SourceConfig, format: FormatConfig, params?: P): Promise<R>;
    readStream?(config: SourceConfig, format: FormatConfig, params?: P): AsyncIterable<R>;
}
```

## Error Handling

```typescript
class DataError extends Error {
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
```

## Utility Types

```typescript
type DataTransform<T, R> = (data: T) => R;
type DataFilter<T> = (data: T) => boolean;
type DataValidator<T> = (data: T) => boolean;
```

## Service Options

```typescript
interface DataServiceOptions<T> {
    transform?: DataTransform<T, T>;
    validate?: DataValidator<T>;
    filter?: DataFilter<T>;
}
``` 