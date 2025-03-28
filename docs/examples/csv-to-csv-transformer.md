# CSV to CSV Transformer Example

This example demonstrates how to transform data between different CSV formats using QuickByte's transformation capabilities.

## Overview

The example reads data from a source CSV file, applies transformations to the data, and writes the result to a new CSV file with a different structure.

## Key Features

- CSV reading with custom parsing
- Data transformation between CSV formats
- Custom field mapping
- Data validation
- CSV writing with custom formatting

## Code Example

```typescript
// Define input and output types
interface InputRecord {
  id: string;
  name: string;
  email: string;
  age: string;
  status: string;
}

interface OutputRecord {
  userId: number;
  fullName: string;
  contact: {
    email: string;
    age: number;
  };
  isActive: boolean;
}

// Create CSV reader
const csvReader = createCsvReader<InputRecord>({
  type: DataSource.FILE,
  options: {
    path: './data/input/users.csv',
    encoding: 'utf-8',
    delimiter: ',',
    headers: true
  }
});

// Create CSV writer
const csvWriter = createCsvWriter<OutputRecord>({
  type: DataSource.FILE,
  options: {
    path: './data/output/transformed-users.csv',
    encoding: 'utf-8',
    delimiter: ',',
    columns: ['userId', 'fullName', 'contact.email', 'contact.age', 'isActive']
  }
});

// Create transformers
const idTransformer = createMapTransformer<InputRecord, Partial<OutputRecord>>({
  name: 'idTransformer',
  description: 'Converts string ID to number',
  field: 'userId',
  operation: MapOperation.NUMBER,
  transform: (record) => ({
    userId: parseInt(record.id, 10)
  })
});

const nameTransformer = createMapTransformer<InputRecord, Partial<OutputRecord>>({
  name: 'nameTransformer',
  description: 'Maps name to fullName',
  field: 'fullName',
  operation: MapOperation.STRING,
  transform: (record) => ({
    fullName: record.name
  })
});

const contactTransformer = createMapTransformer<InputRecord, Partial<OutputRecord>>({
  name: 'contactTransformer',
  description: 'Creates contact object with email and age',
  field: 'contact',
  operation: MapOperation.OBJECT,
  transform: (record) => ({
    contact: {
      email: record.email,
      age: parseInt(record.age, 10)
    }
  })
});

const statusTransformer = createMapTransformer<InputRecord, Partial<OutputRecord>>({
  name: 'statusTransformer',
  description: 'Converts status to boolean isActive',
  field: 'isActive',
  operation: MapOperation.BOOLEAN,
  transform: (record) => ({
    isActive: record.status === 'active'
  })
});

// Create validation transformer
const validationTransformer = createFilterTransformer<OutputRecord>({
  name: 'validationTransformer',
  description: 'Validates transformed records',
  field: 'userId',
  operator: FilterOperator.GREATER_THAN,
  value: 0,
  predicate: (record) => 
    record.userId > 0 && 
    record.contact.age >= 0 && 
    record.contact.email.includes('@')
});

// Create transformation pipeline
const transformerPipeline = createTransformerPipeline<InputRecord, OutputRecord>([
  idTransformer,
  nameTransformer,
  contactTransformer,
  statusTransformer,
  validationTransformer
]);
```

## How It Works

1. **Data Reading**: The example reads from a source CSV file with a specific structure.

2. **Data Transformation**: Multiple transformers handle different aspects:
   - `idTransformer`: Converts string IDs to numbers
   - `nameTransformer`: Maps the name field
   - `contactTransformer`: Creates a nested contact object
   - `statusTransformer`: Converts status to boolean
   - `validationTransformer`: Validates the transformed data

3. **CSV Writing**: The transformed data is written to a new CSV file with:
   - Custom column ordering
   - Nested field support
   - Proper type conversion

## Running the Example

```bash
ts-node examples/csv-to-csv.transformer.ts
```

## Input Format

The input CSV should have the following structure:
```csv
id,name,email,age,status
1,John Doe,john@example.com,30,active
2,Jane Smith,jane@example.com,25,inactive
```

## Output Format

The output CSV will have this structure:
```csv
userId,fullName,contact.email,contact.age,isActive
1,John Doe,john@example.com,30,true
2,Jane Smith,jane@example.com,25,false
```

## Error Handling

The example includes validation and error handling:
```typescript
try {
  // Operation code
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

## Best Practices Demonstrated

1. **Type Safety**: Strong typing for input and output records
2. **Validation**: Data validation before writing
3. **Modularity**: Separate transformers for each transformation
4. **Configuration**: Flexible CSV reading and writing options
5. **Error Handling**: Comprehensive error catching and logging

## See Also

- [CSV Transform Example](./csv-transform.md)
- [Dynamic Transformer Example](./dynamic-transformer.md)
- [CSV to MongoDB Example](./csv-to-mongo.md) 