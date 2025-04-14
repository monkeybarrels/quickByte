# Flexible Pipeline

This is a more flexible implementation of the data pipeline that allows for more loosely coupled components and easier composition.

## Key Features

- **Loosely Coupled Components**: Readers, transformers, and writers are loosely coupled and can be composed in any order.
- **Flexible Type System**: Uses a more flexible type system that allows for any data type.
- **Component Registry**: Provides a registry for component factories, making it easy to create components from configuration.
- **Custom Components**: Supports creating custom components that implement the Reader, Transformer, or Writer interfaces.
- **Composable Pipelines**: Pipelines can be composed from existing components, making it easy to reuse components across different pipelines.

## Architecture

The flexible pipeline consists of the following components:

- **Reader**: Reads data from a source (API, CSV, MongoDB, etc.)
- **Transformer**: Transforms data (field mapping, filtering, etc.)
- **Writer**: Writes data to a destination (CSV, MongoDB, API, etc.)
- **Pipeline**: Orchestrates the flow of data from reader through transformers to writer
- **Registry**: Provides factories for creating components from configuration

## Usage

### Basic Usage

```typescript
import { FlexiblePipeline, defaultRegistry } from './flexible';

// Create a pipeline configuration
const config = {
  reader: defaultRegistry.createReader({
    type: 'API',
    location: 'http://example.com/api/data',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }),
  transformers: [
    defaultRegistry.createTransformer({
      type: 'FIELD_MAPPING',
      fieldMap: {
        'id': 'id',
        'name': 'name',
        'value': 'value'
      }
    })
  ],
  writer: defaultRegistry.createWriter({
    type: 'CSV',
    location: 'output.csv',
    options: {
      delimiter: ',',
      headers: true
    }
  })
};

// Create and run the pipeline
const pipeline = new FlexiblePipeline(config);
await pipeline.run();
```

### Creating Custom Components

```typescript
import { Reader, Transformer, Writer, FlexiblePipeline } from './flexible';

// Create a custom reader
const customReader: Reader = {
  async read(): Promise<any[]> {
    return [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 }
    ];
  }
};

// Create a custom transformer
const customTransformer: Transformer = {
  async transform(data: any[]): Promise<any[]> {
    return data.map(item => ({
      ...item,
      value: item.value * 2
    }));
  }
};

// Create a custom writer
const customWriter: Writer = {
  async write(data: any[]): Promise<void> {
    console.log(data);
  }
};

// Create a pipeline with custom components
const config = {
  reader: customReader,
  transformers: [customTransformer],
  writer: customWriter
};

const pipeline = new FlexiblePipeline(config);
await pipeline.run();
```

### Composing Pipelines

```typescript
import { FlexiblePipeline, defaultRegistry } from './flexible';

// Create components
const apiReader = defaultRegistry.createReader({
  type: 'API',
  location: 'http://example.com/api/data'
});

const fieldExtractor = defaultRegistry.createTransformer({
  type: 'FIELD_MAPPING',
  fieldMap: {
    'id': 'id',
    'name': 'name'
  }
});

const csvWriter = defaultRegistry.createWriter({
  type: 'CSV',
  location: 'output.csv'
});

// Create two different pipelines using the same components
const pipeline1 = new FlexiblePipeline({
  reader: apiReader,
  transformers: [fieldExtractor],
  writer: csvWriter
});

const pipeline2 = new FlexiblePipeline({
  reader: apiReader,
  transformers: [],
  writer: csvWriter
});

// Run both pipelines
await pipeline1.run();
await pipeline2.run();
```

## Extending the Pipeline

### Adding a New Reader

```typescript
import { Reader } from './types';
import { defaultRegistry } from './registry';

// Create a new reader
class MyCustomReader implements Reader {
  async read(): Promise<any[]> {
    // Implementation
    return [];
  }
}

// Register the reader with the registry
defaultRegistry.registerReader('MY_CUSTOM', (config) => new MyCustomReader(config));
```

### Adding a New Transformer

```typescript
import { Transformer } from './types';
import { defaultRegistry } from './registry';

// Create a new transformer
class MyCustomTransformer implements Transformer {
  async transform(data: any[]): Promise<any[]> {
    // Implementation
    return data;
  }
}

// Register the transformer with the registry
defaultRegistry.registerTransformer('MY_CUSTOM', (config) => new MyCustomTransformer(config));
```

### Adding a New Writer

```typescript
import { Writer } from './types';
import { defaultRegistry } from './registry';

// Create a new writer
class MyCustomWriter implements Writer {
  async write(data: any[]): Promise<void> {
    // Implementation
  }
}

// Register the writer with the registry
defaultRegistry.registerWriter('MY_CUSTOM', (config) => new MyCustomWriter(config));
``` 