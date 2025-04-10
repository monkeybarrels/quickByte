# API to CSV Example

This example demonstrates how to fetch data from an API, transform it using multiple transformers, and save the result as a CSV file using QuickByte's data transformation capabilities.

## Overview

The example shows how to:
- Fetch data from a REST API
- Apply multiple transformations to the data
- Filter data based on specific criteria
- Format data for CSV output
- Handle API responses and errors

## Key Features

- API data fetching
- Multiple transformer pipeline
- Data filtering
- Field transformation
- CSV writing with custom columns
- Error handling
- Progress logging

## Complete Example

```typescript
import { createApiReader } from '../src/data/readers/api.reader';
import { createCsvWriter } from '../src/data/writers/csv.writer';
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
    const fileWriter = createCsvWriter<TransformedPost>({
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.csv',
        encoding: 'utf-8',
        columns: ['id', 'userId', 'title', 'body', 'timestamp']
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
        title: post.title.replaceAll('\n',' ').toUpperCase()
      })
    });

    const timestampTransformer = createMapTransformer<Post, TransformedPost>({
      name: 'timestampTransformer',
      description: 'Adds timestamp to each post',
      field: 'timestamp',
      operation: MapOperation.STRING,
      transform: (post) => ({
        ...post,
        timestamp: new Date().toISOString(),
        body: post.body.replaceAll('\n',' ')
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
        path: './data/output/posts.csv',
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

### 3. CSV Writer Configuration

Configure the CSV writer with output options:
```typescript
const fileWriter = createCsvWriter<TransformedPost>({
  type: DataSource.FILE,
  options: {
    path: './data/output/posts.csv',
    encoding: 'utf-8',
    columns: ['id', 'userId', 'title', 'body', 'timestamp']
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
    title: post.title.replaceAll('\n',' ').toUpperCase()
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
    timestamp: new Date().toISOString(),
    body: post.body.replaceAll('\n',' ')
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
ts-node examples/api-to-csv.example.ts
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

The generated CSV file will have this structure:
```csv
id,userId,title,body,timestamp
1,1,EXAMPLE POST,Post content,2024-03-28T12:00:00.000Z
2,1,ANOTHER POST,Another content,2024-03-28T12:00:00.000Z
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
   - CSV writing configuration
   - Column specification
   - UTF-8 encoding

5. **Error Handling**:
   - Try-catch blocks
   - Error logging
   - Promise error catching

## See Also

- [API to JSON Example](./api-to-json.md)
- [CSV Transform Example](./csv-transform.md)
- [Dynamic Transformer Example](./dynamic-transformer.md) 