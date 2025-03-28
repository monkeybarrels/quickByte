# API to JSON Example

This example demonstrates how to fetch data from an API, transform it using multiple transformers, and save the result as a JSON file using QuickByte's data transformation capabilities.

## Overview

The example shows how to:
- Fetch data from a REST API
- Apply multiple transformations to the data
- Filter data based on specific criteria
- Format data for JSON output
- Handle API responses and errors

## Key Features

- API data fetching
- Multiple transformer pipeline
- Data filtering
- Field transformation
- JSON file writing
- Error handling
- Progress logging

## Complete Example

```typescript
import { createApiReader } from '../src/data/readers/api.reader';
import { createFileWriter } from '../src/data/writers/file.writer';
import { DataSource, SourceConfig, TransformerType, MapOperation, FilterOperator } from '../src/data/types';
import { createMapTransformer, createFilterTransformer } from '../src/data/transformers/base.transformers';
import { createTransformerPipeline } from '../src/data/transformers/pipeline';

// Define the type for our API response
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// Define the type for our transformed post
interface TransformedPost extends Post {
  timestamp: string;
}

async function fetchAndSaveToJson() {
  try {
    // Create an API reader to fetch posts
    const apiReader = createApiReader<Post>({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Create a file writer to save the posts
    const fileWriter = createFileWriter<TransformedPost>({
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.json',
        encoding: 'utf-8'
      }
    });

    // Create transformers
    const titleTransformer = createMapTransformer<Post, Post>({
      name: 'titleTransformer',
      description: 'Converts title to uppercase',
      field: 'title',
      operation: MapOperation.TO_UPPER_CASE,
      transform: (post) => ({
        ...post,
        title: post.title.toUpperCase()
      })
    });

    const timestampTransformer = createMapTransformer<Post, TransformedPost>({
      name: 'timestampTransformer',
      description: 'Adds timestamp to each post',
      field: 'timestamp',
      operation: MapOperation.STRING,
      transform: (post) => ({
        ...post,
        timestamp: new Date().toISOString()
      })
    });

    const filterTransformer = createFilterTransformer<TransformedPost>({
      name: 'idFilter',
      description: 'Filters posts with ID <= 50',
      field: 'id',
      operator: FilterOperator.LESS_THAN_EQUALS,
      value: 50,
      predicate: (post) => post.id <= 50
    });

    // Create a pipeline of transformers
    const transformerPipeline = createTransformerPipeline<Post, TransformedPost>([
      titleTransformer,
      timestampTransformer,
      filterTransformer
    ]);

    // Read data from the API
    const sourceConfig: SourceConfig = {
      type: DataSource.API,
      location: 'https://jsonplaceholder.typicode.com/posts'
    };
    const posts = await apiReader.read(sourceConfig);

    // Transform the data
    const transformedPosts = transformerPipeline.transformBatch(posts);

    // Write the data to a JSON file
    await fileWriter.write(transformedPosts, {
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.json',
        encoding: 'utf-8'
      }
    });

    console.log(`Successfully saved ${transformedPosts.length} transformed posts to ./data/output/posts.json`);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Run the example
fetchAndSaveToJson()
  .then(() => console.log('Example completed successfully'))
  .catch(() => console.error('Example failed'));
```

## How It Works

### 1. Data Type Definitions

The example defines two interfaces:
```typescript
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface TransformedPost extends Post {
  timestamp: string;
}
```

### 2. API Reader Configuration

Set up the API reader with request details:
```typescript
const apiReader = createApiReader<Post>({
  url: 'https://jsonplaceholder.typicode.com/posts',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
});
```

### 3. File Writer Configuration

Configure the file writer with output options:
```typescript
const fileWriter = createFileWriter<TransformedPost>({
  type: DataSource.FILE,
  options: {
    path: './data/output/posts.json',
    encoding: 'utf-8'
  }
});
```

### 4. Transformer Pipeline

Create three transformers and combine them into a pipeline:

1. **Title Transformer**:
```typescript
const titleTransformer = createMapTransformer<Post, Post>({
  name: 'titleTransformer',
  description: 'Converts title to uppercase',
  field: 'title',
  operation: MapOperation.TO_UPPER_CASE,
  transform: (post) => ({
    ...post,
    title: post.title.toUpperCase()
  })
});
```

2. **Timestamp Transformer**:
```typescript
const timestampTransformer = createMapTransformer<Post, TransformedPost>({
  name: 'timestampTransformer',
  description: 'Adds timestamp to each post',
  field: 'timestamp',
  operation: MapOperation.STRING,
  transform: (post) => ({
    ...post,
    timestamp: new Date().toISOString()
  })
});
```

3. **Filter Transformer**:
```typescript
const filterTransformer = createFilterTransformer<TransformedPost>({
  name: 'idFilter',
  description: 'Filters posts with ID <= 50',
  field: 'id',
  operator: FilterOperator.LESS_THAN_EQUALS,
  value: 50,
  predicate: (post) => post.id <= 50
});
```

## Running the Example

```bash
ts-node examples/api-to-json.example.ts
```

## API Response Format

The input data from the API will have this structure:
```json
{
  "id": 1,
  "title": "Example Post",
  "body": "Post content",
  "userId": 1
}
```

## Output Format

The generated JSON file will have this structure:
```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "EXAMPLE POST",
    "body": "Post content",
    "timestamp": "2024-03-28T12:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 1,
    "title": "ANOTHER POST",
    "body": "Another content",
    "timestamp": "2024-03-28T12:00:00.000Z"
  }
]
```

## Error Handling

The example includes comprehensive error handling:
```typescript
try {
  // Processing steps
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Interface definitions for API response
   - Generic type parameters
   - Type-safe transformations

2. **API Integration**:
   - HTTP request configuration
   - Response handling
   - Error management

3. **Data Transformation**:
   - Multiple transformer pipeline
   - Field mapping
   - Data filtering
   - String manipulation

4. **File Handling**:
   - JSON file writing
   - UTF-8 encoding
   - Path configuration

5. **Error Handling**:
   - Try-catch blocks
   - Error logging
   - Promise error catching

## See Also

- [API to CSV Example](./api-to-csv.md)
- [JSON Example](./json-example.md)
- [Dynamic Transformer Example](./dynamic-transformer.md) 