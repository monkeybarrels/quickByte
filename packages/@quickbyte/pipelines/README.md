# @quickbyte/pipelines

A flexible data transformation pipeline for QuickByte that allows for loosely coupled components and easy composition.

## Installation

```bash
# Using npm
npm install @quickbyte/pipelines

# Using yarn
yarn add @quickbyte/pipelines

# Using pnpm
pnpm add @quickbyte/pipelines
```

## Features

- **Loosely Coupled Components**: Readers, transformers, and writers are loosely coupled and can be composed in any order
- **Flexible Type System**: Uses a flexible type system that supports any data type
- **Component Registry**: Provides a registry for component factories, making it easy to create components from configuration
- **Custom Components**: Supports creating custom components that implement the Reader, Transformer, or Writer interfaces
- **Composable Pipelines**: Pipelines can be composed from existing components, making it easy to reuse components across different pipelines

## Usage

### Basic Usage

```typescript
import { FlexiblePipeline } from '@quickbyte/pipelines';
import { MemoryReader, MemoryWriter } from '@quickbyte/pipelines';

// Create a pipeline configuration
const pipeline = new FlexiblePipeline({
  reader: new MemoryReader({ data: ['item1', 'item2'] }),
  writer: new MemoryWriter()
});

// Run the pipeline
await pipeline.run();
```

### Using Transformers

```typescript
import { FlexiblePipeline } from '@quickbyte/pipelines';
import { MemoryReader, MemoryWriter, MapTransformer } from '@quickbyte/pipelines';

const pipeline = new FlexiblePipeline({
  reader: new MemoryReader({ data: ['item1', 'item2'] }),
  transformers: [
    new MapTransformer({
      operations: [
        { field: 'value', operation: 'TO_UPPER_CASE' }
      ]
    })
  ],
  writer: new MemoryWriter()
});

await pipeline.run();
```

### Using the Registry

```typescript
import { FlexiblePipeline, defaultRegistry } from '@quickbyte/pipelines';

// Create components using the registry
const reader = defaultRegistry.createReader({
  type: 'MEMORY',
  options: { data: ['item1', 'item2'] }
});

const writer = defaultRegistry.createWriter({
  type: 'MEMORY'
});

const pipeline = new FlexiblePipeline({
  reader,
  writer
});

await pipeline.run();
```

## API Documentation

### FlexiblePipeline

The main class that orchestrates the data flow through the pipeline.

#### Constructor

```typescript
new FlexiblePipeline(config: FlexiblePipelineConfig)
```

#### Methods

- `run(): Promise<void>` - Executes the pipeline

### Interfaces

- `Reader<T>` - Interface for reading data
- `Writer<T>` - Interface for writing data
- `Transformer` - Interface for transforming data
- `FlexiblePipelineConfig` - Configuration for the pipeline

## License

MIT 