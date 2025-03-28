# MongoDB to CSV Example

This example demonstrates how to read data from MongoDB, transform it into CSV format, and save it to a file using QuickByte's data transformation capabilities.

## Overview

The example shows how to:
- Connect to MongoDB and read product data
- Apply query filters and sorting
- Convert MongoDB documents to CSV format
- Write the CSV data to a file
- Handle errors and display progress

## Key Features

- MongoDB query filtering
- Custom CSV formatting
- Field selection and ordering
- Progress logging
- Error handling
- File writing with encoding options

## Complete Example

```typescript
import { createMongoReader } from '../src/data';
import { createCsvFormatter } from '../src/data/formatters/csv.formatter';
import { createFileWriter } from '../src/data/writers/file.writer';
import { DataSource, SourceConfig, FormatConfig, DataFormat } from '../src/data/types';

// Define the type of data we expect from MongoDB
interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

async function readFromMongoAndConvertToCsv() {
    const outputPath = 'data/output/products.csv';

    // Create a MongoDB reader with configuration
    const reader = createMongoReader<Product>({
        connection: {
            uri: 'mongodb://localhost:27017',
            database: 'quickbyte',
            collection: 'products'
        },
        // Optional: add query filter
        query: { inStock: true },
        // Optional: add query options like sorting
        options: { sort: { price: 1 } }
    });

    // Create a CSV formatter
    const csvFormatter = createCsvFormatter<Product>({
        type: DataFormat.CSV,
        options: {
            headers: ['_id', 'name', 'price', 'category', 'inStock'],
            delimiter: ','
        }
    });

    // Create a file writer
    const fileWriter = createFileWriter<string>({
        type: DataSource.FILE,
        options: {
            path: outputPath,
            encoding: 'utf-8',
            append: false
        }
    });

    // Define source configuration
    const sourceConfig: SourceConfig = {
        type: DataSource.MONGODB,
        location: 'products'
    };

    try {
        // Read data from MongoDB
        console.log('Reading products from MongoDB...');
        const products = await reader.read(sourceConfig);
        console.log(`Found ${products.length} products`);

        // Convert to CSV
        console.log('Converting to CSV format...');
        const csvContent = await csvFormatter.format(products, {
            type: DataFormat.CSV,
            options: {
                headers: ['_id', 'name', 'price', 'category', 'inStock'],
                delimiter: ','
            }
        });

        // Write to file using FileWriter
        console.log('Writing to file...');
        await fileWriter.write([csvContent], {
            type: DataSource.FILE,
            options: {
                path: outputPath,
                encoding: 'utf-8'
            }
        });
        console.log(`CSV file saved to ${outputPath}`);

        // Display the CSV content
        console.log('\nCSV Content Preview:');
        console.log(csvContent);

    } catch (error) {
        console.error('Error processing data:', error);
    }
}

// Run the example
readFromMongoAndConvertToCsv().catch(console.error);
```

## How It Works

### 1. Data Type Definition

The example defines an interface for product data:
```typescript
interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}
```

### 2. MongoDB Reader Configuration

Set up the MongoDB reader with connection details and query options:
```typescript
const reader = createMongoReader<Product>({
    connection: {
        uri: 'mongodb://localhost:27017',
        database: 'quickbyte',
        collection: 'products'
    },
    query: { inStock: true },
    options: { sort: { price: 1 } }
});
```

### 3. CSV Formatter Setup

Configure the CSV formatter with headers and delimiter:
```typescript
const csvFormatter = createCsvFormatter<Product>({
    type: DataFormat.CSV,
    options: {
        headers: ['_id', 'name', 'price', 'category', 'inStock'],
        delimiter: ','
    }
});
```

### 4. File Writer Configuration

Set up the file writer with path and encoding options:
```typescript
const fileWriter = createFileWriter<string>({
    type: DataSource.FILE,
    options: {
        path: outputPath,
        encoding: 'utf-8',
        append: false
    }
});
```

## Running the Example

```bash
ts-node examples/mongo-to-csv.ts
```

## MongoDB Document Format

The input data in MongoDB should have this structure:
```json
{
    "_id": "1",
    "name": "Product 1",
    "price": 29.99,
    "category": "Electronics",
    "inStock": true
}
```

## Output Format

The generated CSV file will have this structure:
```csv
_id,name,price,category,inStock
1,Product 1,29.99,Electronics,true
2,Product 2,49.99,Clothing,true
```

## Error Handling

The example includes error handling with logging:
```typescript
try {
    // Processing steps
} catch (error) {
    console.error('Error processing data:', error);
}
```

## Best Practices Demonstrated

1. **Data Type Safety**: 
   - Interface definition for MongoDB documents
   - Type-safe reader and formatter configuration
   - Generic type parameters

2. **MongoDB Integration**:
   - Connection configuration
   - Query filtering
   - Sorting options
   - Collection selection

3. **CSV Formatting**:
   - Custom header configuration
   - Field selection
   - Delimiter specification
   - UTF-8 encoding

4. **File Handling**:
   - Path management
   - Encoding specification
   - Append mode control
   - Content preview

5. **Progress Monitoring**:
   - Step-by-step logging
   - Record count reporting
   - File location confirmation
   - Content preview

## See Also

- [CSV to MongoDB Example](./csv-to-mongo.md)
- [Database Example](./database-example.md)
- [CSV Transform Example](./csv-transform.md) 