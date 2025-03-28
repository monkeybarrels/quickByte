# Dynamic Transformer Example

This example demonstrates how to create flexible and configurable data transformation pipelines using QuickByte's dynamic transformer capabilities. It shows how to define transformations using JSON configuration and apply them to data streams.

## Overview

The example shows how to:
- Define transformer configurations in JSON format
- Create a dynamic transformer pipeline
- Implement custom readers and writers
- Apply multiple transformations in sequence
- Handle MongoDB and CSV data formats

## Key Features

- JSON-based transformer configuration
- Dynamic pipeline creation
- Custom MongoDB reader implementation
- Custom CSV writer implementation
- Multiple transformation types
- Type-safe transformations
- Flexible field mapping

## Complete Example

```typescript
import { createDynamicTransformerPipeline } from '../src/data/transformers/dynamic.transformer';
import { DynamicTransformerConfigUnion } from '../src/data/transformers/dynamic.transformer';
import { TransformerType, FilterOperator, MapOperation, DataSource, DataFormat } from '../src/data/types';
import { createDataTransformer } from '../src/data/transformers/data.transformer';
import { MongoClient } from 'mongodb';
import { CsvFormatter } from '../src/data/formatters/csv.formatter';
import { FileWriter, FileWriterConfig } from '../src/data/writers/file.writer';

// Example data structure
interface UserData {
    userid: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    status: string;
}

// Example of creating a transformer pipeline from JSON configuration
async function dynamicTransformerExample() {
    // Example JSON configuration for transformers
    const transformerConfigs: DynamicTransformerConfigUnion[] = [
        {
            type: TransformerType.FIELD_MAPPING,
            name: 'fieldMapper',
            description: 'Maps MongoDB fields to CSV fields',
            fieldMap: {
                'firstName': 'first_name',
                'lastName': 'last_name'
            },
            dropUnmapped: false
        },
        {
            type: TransformerType.FILTER,
            name: 'activeUsers',
            description: 'Only includes active users',
            field: 'status',
            operator: FilterOperator.EQUALS,
            value: 'active'
        },
        {
            type: TransformerType.MAP,
            name: 'dataCleaner',
            description: 'Cleans and validates user data',
            operations: [
                { field: 'email', operation: MapOperation.TO_LOWER_CASE },
                { field: 'age', operation: MapOperation.NUMBER }
            ]
        }
    ];

    // Create the transformer pipeline
    const pipeline = createDynamicTransformerPipeline<UserData, UserData>(transformerConfigs);

    // Create the data transformer with MongoDB reader and CSV writer
    const dataTransformer = createDataTransformer<UserData, UserData>({
        reader: {
            read: async (config) => {
                const client = new MongoClient(config.location);
                try {
                    await client.connect();
                    const db = client.db(config.options?.database as string);
                    const collection = db.collection(config.options?.collection as string);
                    
                    // Query the collection
                    const cursor = collection.find({});
                    const documents = await cursor.toArray();
                    
                    // Transform MongoDB documents to UserData
                    const transformedData = documents.map(doc => ({
                        userid: doc._id.toString(),
                        firstName: doc.firstName,
                        lastName: doc.lastName,
                        email: doc.email,
                        age: doc.age,
                        status: doc.status
                    }));

                    return transformedData;
                } finally {
                    await client.close();
                }
            }
        },
        writer: {
            write: async (data, config) => {
                const fileWriter = new FileWriter(config as FileWriterConfig);
                await fileWriter.write(data, config);
            }
        },
        formatter: {
            format: async (data, config) => {
                const csvFormatter = new CsvFormatter<UserData>(config);
                return csvFormatter.format(data, config);
            },
            parse: async (data, config) => {
                return data as unknown as UserData[];
            }
        },
        transform: (item) => { 
            const transformedItem = pipeline.transform(item);
            return transformedItem;
        },
        sourceConfig: {
            type: DataSource.MONGODB,
            location: 'mongodb://localhost:27017',
            options: {
                database: 'example_db',
                collection: 'users'
            }
        },
        writerConfig: {
            type: DataSource.FILE,
            options: {
                path: './data/output/users.csv',
                format: DataFormat.CSV,
                headers: ['userid', 'first_name', 'last_name', 'email', 'age', 'status']
            }
        },
        formatterConfig: {
            type: DataFormat.CSV,
            options: {
                headers: ['userid', 'first_name', 'last_name', 'email', 'age', 'status']
            }
        }
    });

    // Transform the data
    await dataTransformer.transform();
}

// Run the example
dynamicTransformerExample().catch(console.error);
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

### 2. Transformer Configuration

Define transformer configurations in JSON format:
```typescript
const transformerConfigs: DynamicTransformerConfigUnion[] = [
    {
        type: TransformerType.FIELD_MAPPING,
        name: 'fieldMapper',
        description: 'Maps MongoDB fields to CSV fields',
        fieldMap: {
            'firstName': 'first_name',
            'lastName': 'last_name'
        },
        dropUnmapped: false
    },
    // ... other transformers
];
```

### 3. Pipeline Creation

Create a dynamic transformer pipeline:
```typescript
const pipeline = createDynamicTransformerPipeline<UserData, UserData>(transformerConfigs);
```

### 4. Custom Reader Implementation

Implement a custom MongoDB reader:
```typescript
reader: {
    read: async (config) => {
        const client = new MongoClient(config.location);
        try {
            await client.connect();
            const db = client.db(config.options?.database as string);
            const collection = db.collection(config.options?.collection as string);
            
            const cursor = collection.find({});
            const documents = await cursor.toArray();
            
            return documents.map(doc => ({
                userid: doc._id.toString(),
                firstName: doc.firstName,
                lastName: doc.lastName,
                email: doc.email,
                age: doc.age,
                status: doc.status
            }));
        } finally {
            await client.close();
        }
    }
}
```

## Running the Example

```bash
ts-node examples/dynamic-transformer-example.ts
```

## Input Format

The input data in MongoDB should have this structure:
```json
{
    "_id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "age": 30,
    "status": "active"
}
```

## Output Format

The transformed CSV file will have this structure:
```csv
userid,first_name,last_name,email,age,status
1,John,Doe,john@example.com,30,active
2,Jane,Smith,jane@example.com,25,active
```

## Error Handling

The example includes error handling with MongoDB connection management:
```typescript
try {
    // MongoDB operations
} finally {
    await client.close();
}
```

## Best Practices Demonstrated

1. **Configuration Management**: 
   - JSON-based transformer configuration
   - Type-safe configuration validation
   - Modular transformer definitions

2. **Custom Implementations**:
   - Custom MongoDB reader
   - Custom CSV writer
   - Custom formatter

3. **Data Transformation**:
   - Field mapping
   - Data filtering
   - Data cleaning
   - Type conversion

4. **Resource Management**:
   - MongoDB connection handling
   - Proper cleanup in finally blocks
   - Async/await usage

5. **Type Safety**:
   - Interface definitions
   - Generic type parameters
   - Type-safe transformations

## See Also

- [CSV to MongoDB Example](./csv-to-mongo.md)
- [MongoDB to CSV Example](./mongo-to-csv.md)
- [CSV Transform Example](./csv-transform.md) 