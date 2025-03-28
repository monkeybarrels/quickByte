# CSV Transform Example

This example demonstrates how to transform CSV data with field mapping and custom formatting using QuickByte's data transformation capabilities.

## Overview

The example shows how to read a CSV file containing product data, transform the field names and structure, and write the result to a new CSV file with custom formatting. It demonstrates advanced features like field mapping, custom headers, and type-safe transformations.

## Key Features

- Type-safe CSV reading and writing
- Field name mapping
- Custom CSV formatting
- Explicit header configuration
- Error handling with try-catch
- UTF-8 encoding support

## Complete Example

```typescript
import { createCsvReader } from '../src/data/readers/csv.reader';
import { createCsvFormatter } from '../src/data/formatters/csv.formatter';
import { createFileWriter } from '../src/data/writers/file.writer';
import { createDataTransformer } from '../src/data/transformers/data.transformer';
import { DataSource, SourceConfig, FormatConfig, DataFormat } from '../src/data/types';
import { promises as fs } from 'fs';

// Define the input and output data types
interface InputProduct {
    product_id: string;
    product_name: string;
    unit_price: number;
    category: string;
    available: boolean;
}

interface OutputProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

async function transformCsvFormat() {
    const inputPath = 'data/input/products.csv';
    const outputPath = 'data/output/transformed-products.csv';

    // Read input file content
    const fileContent = await fs.readFile(inputPath, 'utf-8');

    // Create the transformer
    const transformer = createDataTransformer<InputProduct, OutputProduct>({
        // Reader configuration
        reader: createCsvReader<InputProduct>({
            path: inputPath,
            format: DataFormat.CSV,
            delimiter: ','
        }),
        sourceConfig: {
            type: DataSource.FILE,
            location: inputPath,
            options: { content: fileContent }
        },

        // Writer configuration
        writer: createFileWriter<OutputProduct>({
            type: DataSource.FILE,
            options: {
                path: outputPath,
                encoding: 'utf-8'
            }
        }),
        writerConfig: {
            type: DataSource.FILE,
            options: {
                path: outputPath,
                encoding: 'utf-8'
            }
        },

        // Formatter configuration
        formatter: createCsvFormatter<OutputProduct>({
            type: DataFormat.CSV,
            options: {
                headers: ['id', 'name', 'price', 'category', 'inStock'],
                delimiter: ','
            }
        }),
        formatterConfig: {
            type: DataFormat.CSV,
            options: {
                headers: ['id', 'name', 'price', 'category', 'inStock'],
                delimiter: ','
            }
        },

        // Transformation function
        transform: (product: InputProduct) => ({
            id: product.product_id,
            name: product.product_name,
            price: product.unit_price,
            category: product.category,
            inStock: product.available
        })
    });

    try {
        // Run the transformation
        await transformer.transform();
        console.log('Transformation completed successfully!');
    } catch (error) {
        console.error('Error during transformation:', error);
    }
}

// Run the example
transformCsvFormat().catch(console.error);
```

## How It Works

### 1. Data Type Definitions

The example defines two interfaces to ensure type safety:

```typescript
interface InputProduct {
    product_id: string;
    product_name: string;
    unit_price: number;
    category: string;
    available: boolean;
}

interface OutputProduct {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}
```

### 2. File Reading

The input file is read with UTF-8 encoding:
```typescript
const fileContent = await fs.readFile(inputPath, 'utf-8');
```

### 3. Transformer Configuration

The transformer is configured with reader, writer, and formatter:

```typescript
const transformer = createDataTransformer<InputProduct, OutputProduct>({
    reader: createCsvReader<InputProduct>({
        path: inputPath,
        format: DataFormat.CSV,
        delimiter: ','
    }),
    // ... other configurations
});
```

### 4. Field Mapping

The transformation function maps fields from input to output format:
```typescript
transform: (product: InputProduct) => ({
    id: product.product_id,
    name: product.product_name,
    price: product.unit_price,
    category: product.category,
    inStock: product.available
})
```

### 5. CSV Formatting

Custom CSV formatting is configured with explicit headers:
```typescript
formatter: createCsvFormatter<OutputProduct>({
    type: DataFormat.CSV,
    options: {
        headers: ['id', 'name', 'price', 'category', 'inStock'],
        delimiter: ','
    }
})
```

## Running the Example

```bash
ts-node examples/csv-transform.ts
```

## Input Format

The input CSV file should have this structure:
```csv
product_id,product_name,unit_price,category,available
P001,Product 1,29.99,Electronics,true
P002,Product 2,49.99,Clothing,false
```

## Output Format

The transformed CSV file will have this structure:
```csv
id,name,price,category,inStock
P001,Product 1,29.99,Electronics,true
P002,Product 2,49.99,Clothing,false
```

## Error Handling

The example includes comprehensive error handling:
```typescript
try {
    await transformer.transform();
    console.log('Transformation completed successfully!');
} catch (error) {
    console.error('Error during transformation:', error);
}
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Strong typing for input and output
   - Generic type parameters
   - Interface definitions

2. **File Handling**:
   - UTF-8 encoding specification
   - Proper file path management
   - Async file operations

3. **Configuration**:
   - Explicit header configuration
   - Custom delimiter support
   - Flexible formatting options

4. **Error Handling**:
   - Try-catch blocks
   - Error logging
   - Promise error catching

5. **Code Organization**:
   - Clear interface definitions
   - Modular transformer setup
   - Separation of concerns

## See Also

- [CSV to CSV Transformer Example](./csv-to-csv-transformer.md)
- [Basic CSV Example](./csv-example.md)
- [Dynamic Transformer Example](./dynamic-transformer.md) 