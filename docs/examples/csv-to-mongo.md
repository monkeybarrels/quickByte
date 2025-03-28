# CSV to MongoDB Example

This example demonstrates how to create an ETL (Extract, Transform, Load) pipeline that reads data from a CSV file, applies multiple transformations, and loads the result into MongoDB using QuickByte's transformation capabilities.

## Overview

The example shows how to:
- Read user data from a CSV file
- Apply field mapping to standardize field names
- Filter data based on specific criteria
- Clean and validate the data
- Write the transformed data to MongoDB

## Key Features

- MongoDB connection handling
- Multiple transformer pipeline
- Field mapping
- Data filtering
- Data cleaning and validation
- Comprehensive error handling
- Progress logging

## Complete Example

```typescript
import { createCsvReader } from '../src/data/readers/csv.reader';
import { createMongoFormatter } from '../src/data/formatters/mongo.formatter';
import { createFieldMappingTransformer, createFilterTransformer, createMapTransformer } from '../src/data/transformers/base.transformers';
import { createTransformerPipeline } from '../src/data/transformers/pipeline';
import { SourceConfig, FormatConfig, MongoConnection, DataSource, DataFormat, FilterOperator, MapOperation } from '../src/data/types';
import { promises as fs } from 'fs';

// Example data structure
interface UserData {
    userid: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    status: string;
}

// Example CSV data
async function csvToMongoExample() {
    // 1. Set up MongoDB connection
    const mongoConnection: MongoConnection = {
        uri: 'mongodb://localhost:27017',
        database: 'example_db',
        collection: 'users',
        options: {}
    };

    // 2. Read CSV file content
    const csvContent = await fs.readFile('data/users.csv', 'utf-8');

    // 3. Create source config for CSV
    const sourceConfig: SourceConfig = {
        type: DataSource.FILE,
        location: 'data/users.csv',
        options: {
            content: csvContent
        }
    };

    // 5. Create MongoDB formatter config
    const mongoFormatConfig: FormatConfig = {
        type: DataFormat.MONGODB,
        options: {
            connection: mongoConnection
        }
    };

    // 6. Create transformers
    const fieldMapper = createFieldMappingTransformer({
        name: 'fieldMapper',
        description: 'Maps CSV fields to MongoDB fields',
        fieldMap: {
            'first_name': 'firstName',
            'last_name': 'lastName'
        },
        dropUnmapped: false
    });

    const filter = createFilterTransformer<UserData>({
        name: 'activeUsers',
        description: 'Only includes active users',
        field: 'status',
        operator: FilterOperator.EQUALS,
        value: 'active',
        predicate: (user: UserData) => user.status === 'active'
    });

    const mapper = createMapTransformer<UserData, UserData>({
        name: 'dataCleaner',
        description: 'Cleans and validates user data',
        field: 'email',
        operation: MapOperation.TO_LOWER_CASE,
        transform: (user: UserData) => ({
            ...user,
            email: user.email.toLowerCase(),
            age: Number(user.age)
        })
    });

    // 7. Create transformer pipeline
    const pipeline = createTransformerPipeline<UserData, UserData>([
        fieldMapper,
        filter,
        mapper
    ]);

    try {
        // 8. Create readers and formatters
        const csvReader = createCsvReader<UserData>({ path: 'data/users.csv', format: DataFormat.CSV });
        const mongoFormatter = createMongoFormatter<UserData>({
            type: DataFormat.MONGODB,
            options: {
                connection: mongoConnection
            }
        });

        // 9. Read CSV data
        console.log('Reading CSV data...');
        const rawData = await csvReader.read(sourceConfig);
        
        // 10. Transform data
        console.log('Transforming data...');
        const transformedData = pipeline.transformBatch(rawData);
        
        // 11. Format and write to MongoDB
        console.log('Writing to MongoDB...');
        await mongoFormatter.format(transformedData, mongoFormatConfig);
        
        console.log('ETL process completed successfully!');
        console.log(`Processed ${transformedData.length} records`);
        
    } catch (error) {
        console.error('ETL process failed:', error);
        throw error;
    }
}

// Run the example
csvToMongoExample().catch(console.error);
```

## How It Works

### 1. Data Type Definition

The example defines an interface for user data:
```typescript
interface UserData {
    userid: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    status: string;
}
```

### 2. MongoDB Connection Setup

Configure MongoDB connection details:
```typescript
const mongoConnection: MongoConnection = {
    uri: 'mongodb://localhost:27017',
    database: 'example_db',
    collection: 'users',
    options: {}
};
```

### 3. Transformer Pipeline

The example creates three transformers and combines them into a pipeline:

1. **Field Mapper**:
```typescript
const fieldMapper = createFieldMappingTransformer({
    name: 'fieldMapper',
    description: 'Maps CSV fields to MongoDB fields',
    fieldMap: {
        'first_name': 'firstName',
        'last_name': 'lastName'
    },
    dropUnmapped: false
});
```

2. **Filter Transformer**:
```typescript
const filter = createFilterTransformer<UserData>({
    name: 'activeUsers',
    description: 'Only includes active users',
    field: 'status',
    operator: FilterOperator.EQUALS,
    value: 'active',
    predicate: (user: UserData) => user.status === 'active'
});
```

3. **Data Cleaner**:
```typescript
const mapper = createMapTransformer<UserData, UserData>({
    name: 'dataCleaner',
    description: 'Cleans and validates user data',
    field: 'email',
    operation: MapOperation.TO_LOWER_CASE,
    transform: (user: UserData) => ({
        ...user,
        email: user.email.toLowerCase(),
        age: Number(user.age)
    })
});
```

### 4. Pipeline Creation

Combine transformers into a pipeline:
```typescript
const pipeline = createTransformerPipeline<UserData, UserData>([
    fieldMapper,
    filter,
    mapper
]);
```

## Running the Example

```bash
ts-node examples/csv-to-mongo.ts
```

## Input Format

The input CSV file should have this structure:
```csv
userid,first_name,last_name,email,age,status
1,John,Doe,john@example.com,30,active
2,Jane,Smith,jane@example.com,25,inactive
```

## MongoDB Document Format

The transformed data will be stored in MongoDB with this structure:
```json
{
    "userid": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "age": 30,
    "status": "active"
}
```

## Error Handling

The example includes comprehensive error handling:
```typescript
try {
    // ETL process steps
} catch (error) {
    console.error('ETL process failed:', error);
    throw error;
}
```

## Best Practices Demonstrated

1. **Data Type Safety**: 
   - Interface definition for data structure
   - Generic type parameters in transformers
   - Type-safe MongoDB operations

2. **Pipeline Organization**:
   - Modular transformer components
   - Clear transformation steps
   - Reusable transformer pipeline

3. **Data Validation**:
   - Field mapping validation
   - Status filtering
   - Data type conversion

4. **Error Handling**:
   - Try-catch blocks
   - Detailed error logging
   - Process status tracking

5. **Progress Monitoring**:
   - Step-by-step logging
   - Record count reporting
   - Process completion confirmation

## See Also

- [MongoDB to CSV Example](./mongo-to-csv.md)
- [Dynamic Transformer Example](./dynamic-transformer.md)
- [Database Example](./database-example.md) 