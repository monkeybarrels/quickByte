# API to CSV Example

This example demonstrates how to fetch data from an API, transform it, and save it as a CSV file using QuickByte.

## Overview

The example fetches posts from the JSONPlaceholder API, applies several transformations (including text cleaning and filtering), and saves the result as a CSV file. It demonstrates how to handle API data, clean text content, and maintain proper data structure throughout the transformation process.

## Key Features

- API data fetching with custom headers
- Data transformation pipeline with multiple steps
- CSV writing with column ordering
- Text cleaning (removing newlines)
- Filtering data based on conditions
- Type-safe transformations
- Error handling and logging

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
      description: 'Converts title to uppercase and removes newlines',
      field: 'title',
      operation: MapOperation.TO_UPPER_CASE,
      transform: (post) => ({
        ...post,
        title: post.title.replaceAll('\n',' ').toUpperCase()
      })
    });

    const timestampTransformer = createMapTransformer<Post, TransformedPost>({
      name: 'timestampTransformer',
      description: 'Adds timestamp and cleans body text',
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

    // Write the data to a CSV file
    await fileWriter.write(transformedPosts, {
      type: DataSource.FILE,
      options: {
        path: './data/output/posts.csv',
        encoding: 'utf-8'
      }
    });

    console.log(`Successfully saved ${transformedPosts.length} transformed posts to ./data/output/posts.csv`);
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

### 1. Data Types and Interfaces

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

These interfaces ensure type safety throughout the transformation process.

### 2. API Reader Setup

The API reader is configured to fetch data from JSONPlaceholder:
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

The CSV writer is set up with specific column ordering:
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

### 4. Transformation Pipeline

The example creates three transformers:

1. **Title Transformer**: Converts titles to uppercase and removes newlines
```typescript
const titleTransformer = createMapTransformer<Post, Post>({
  name: 'titleTransformer',
  description: 'Converts title to uppercase and removes newlines',
  field: 'title',
  operation: MapOperation.TO_UPPER_CASE,
  transform: (post) => ({
    ...post,
    title: post.title.replaceAll('\n',' ').toUpperCase()
  })
});
```

2. **Timestamp Transformer**: Adds timestamps and cleans body text
```typescript
const timestampTransformer = createMapTransformer<Post, TransformedPost>({
  name: 'timestampTransformer',
  description: 'Adds timestamp and cleans body text',
  field: 'timestamp',
  operation: MapOperation.STRING,
  transform: (post) => ({
    ...post,
    timestamp: new Date().toISOString(),
    body: post.body.replaceAll('\n',' ')
  })
});
```

3. **Filter Transformer**: Filters posts by ID
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

### 5. Pipeline Execution

The transformers are combined into a pipeline:
```typescript
const transformerPipeline = createTransformerPipeline<Post, TransformedPost>([
  titleTransformer,
  timestampTransformer,
  filterTransformer
]);
```

## Running the Example

```bash
ts-node examples/api-to-csv.example.ts
```

## Input Data

The example fetches data from the JSONPlaceholder API, which returns posts in this format:
```json
{
  "id": 1,
  "title": "sunt aut facere repellat provident",
  "body": "quia et suscipit\nsuscipit recusandae",
  "userId": 1
}
```

## Output Format

The transformed CSV file will have this structure:
```csv
id,userId,title,body,timestamp
1,1,"SUNT AUT FACERE REPELLAT PROVIDENT","quia et suscipit suscipit recusandae","2024-03-28T12:00:00.000Z"
```

## Error Handling

The example includes comprehensive error handling at multiple levels:
```typescript
try {
  // Main operation code
} catch (error) {
  console.error('Error:', error);
  throw error;
}

// Promise-based error handling
fetchAndSaveToJson()
  .then(() => console.log('Example completed successfully'))
  .catch(() => console.error('Example failed'));
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Strong typing with interfaces
   - Generic type parameters in transformers
   - Type checking throughout the pipeline

2. **Data Cleaning**:
   - Removal of newlines from text
   - Consistent text formatting
   - Data validation

3. **Configuration**:
   - Flexible API reader setup
   - Configurable CSV writer
   - Customizable transformation pipeline

4. **Error Handling**:
   - Try-catch blocks
   - Promise error handling
   - Detailed error logging

5. **Resource Management**:
   - Proper file handling
   - API connection management
   - Memory-efficient transformations

## See Also

- [API to JSON Example](./api-to-json.md)
- [CSV Transform Example](./csv-transform.md)
- [Dynamic Transformer Example](./dynamic-transformer.md) 