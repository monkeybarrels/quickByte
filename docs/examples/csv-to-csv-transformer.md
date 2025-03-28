# CSV to CSV Transformer Example

This example demonstrates how to read data from a CSV file, apply a simple transformation, and write the result to another CSV file using QuickByte's data transformation capabilities.

## Overview

The example shows how to:
- Read data from a CSV file
- Apply a transformation to the data
- Write the transformed data to a new CSV file
- Handle file operations and errors

## Key Features

- CSV file reading and writing
- Simple data transformation
- Flexible data structure
- File system integration
- Error handling

## Complete Example

```typescript
import { DataFormat, DataSource } from '../src/data/types';
import { createDataTransformer } from '../src/data/transformers/data.transformer';
import { createCsvReader } from '../src/data/readers/csv.reader';
import { createCsvWriter } from '../src/data/writers/csv.writer';
import { promises as fs } from 'fs';

interface User {
    age: number;
    [key: string]: any;
}

async function main() {
    const csvContent = await fs.readFile('./data/input/users.csv', 'utf-8');
    
    const transformer = createDataTransformer<User, User>({
        reader: createCsvReader(),
        writer: createCsvWriter({
            type: DataSource.FILE,
            options: {
                path: './data/output/users2.csv',
                delimiter: ','
            }
        }),
        sourceConfig: {
            type: DataSource.FILE,
            location: './data/input/users.csv',
            options: {
                format: DataFormat.CSV,
                content: csvContent
            }
        },
        writerConfig: {
            type: DataSource.FILE,
            options: {
                path: './data/output/users2.csv',
                format: DataFormat.CSV
            }
        },
        transform: (user: User) => ({
            ...user,
            age: user.age + 1,
        }),
    });

    await transformer.transform();
}

main().catch(console.error);
```

## How It Works

### 1. Data Type Definition

The example defines a flexible interface for user data:
```typescript
interface User {
    age: number;
    [key: string]: any;
}
```

This interface ensures that:
- The `age` field is required and must be a number
- Additional fields are allowed through the index signature

### 2. File Reading

Read the input CSV file:
```typescript
const csvContent = await fs.readFile('./data/input/users.csv', 'utf-8');
```

### 3. Transformer Configuration

Set up the data transformer with reader, writer, and transformation logic:
```typescript
const transformer = createDataTransformer<User, User>({
    reader: createCsvReader(),
    writer: createCsvWriter({
        type: DataSource.FILE,
        options: {
            path: './data/output/users2.csv',
            delimiter: ','
        }
    }),
    sourceConfig: {
        type: DataSource.FILE,
        location: './data/input/users.csv',
        options: {
            format: DataFormat.CSV,
            content: csvContent
        }
    },
    writerConfig: {
        type: DataSource.FILE,
        options: {
            path: './data/output/users2.csv',
            format: DataFormat.CSV
        }
    },
    transform: (user: User) => ({
        ...user,
        age: user.age + 1,
    }),
});
```

## Running the Example

```bash
ts-node examples/csv-to-csv.transformer.ts
```

## Input Format

The input CSV file should have this structure:
```csv
name,age,email
John Doe,25,john@example.com
Jane Smith,30,jane@example.com
```

## Output Format

The transformed CSV file will have this structure:
```csv
name,age,email
John Doe,26,john@example.com
Jane Smith,31,jane@example.com
```

## Error Handling

The example includes basic error handling:
```typescript
main().catch(console.error);
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Interface definition for user data
   - Flexible data structure
   - Type-safe transformations

2. **File Operations**:
   - UTF-8 encoding
   - Proper file paths
   - CSV format handling

3. **Data Transformation**:
   - Simple field modification
   - Data structure preservation
   - Efficient processing

4. **Configuration**:
   - Reader and writer setup
   - Format specification
   - Delimiter configuration

5. **Error Handling**:
   - Promise error catching
   - Error logging
   - Graceful failure handling

## See Also

- [CSV Transform Example](./csv-transform.md)
- [CSV to MongoDB Example](./csv-to-mongo.md)
- [MongoDB to CSV Example](./mongo-to-csv.md) 