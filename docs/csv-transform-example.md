# CSV Format Transformation Example

This example demonstrates how to use the QuickByte framework to transform data from one CSV format to another using the `DataTransformer` class.

## Overview

The example shows how to:
1. Read data from a CSV file in one format
2. Transform the data structure
3. Format the transformed data into a new CSV format
4. Write the result to a file

## Input Format

The example expects input CSV data in the following format:
```csv
product_id,product_name,unit_price,category,available
1,Product A,10.99,Electronics,true
2,Product B,15.50,Books,false
```

## Output Format

The transformed data will be written in this format:
```csv
id,name,price,category,inStock
1,Product A,10.99,Electronics,true
2,Product B,15.50,Books,false
```

## Code Example

```typescript
// Define input and output data types
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
```

## Usage

1. Create an input CSV file at `data/input/products.csv` with your data in the input format
2. Run the example:
   ```bash
   ts-node examples/csv-transform.ts
   ```
3. The transformed data will be written to `data/output/transformed-products.csv`

## Key Components

### Data Types
- `InputProduct`: Defines the structure of the input CSV data
- `OutputProduct`: Defines the structure of the transformed data

### Transformer Configuration
- **Reader**: `createCsvReader` reads the input CSV file
- **Writer**: `createFileWriter` writes the output to a file
- **Formatter**: `createCsvFormatter` formats the transformed data into CSV
- **Transform Function**: Maps input fields to output fields

## Error Handling

The example includes error handling for:
- File reading errors
- CSV parsing errors
- Transformation errors
- File writing errors

## Customization

You can customize the transformation by:
1. Modifying the input/output interfaces to match your data structure
2. Adjusting the transformation function to map fields differently
3. Changing the CSV format options (delimiter, headers, etc.)
4. Modifying the input/output file paths

## Best Practices

1. Always define clear interfaces for input and output data types
2. Use type-safe transformations to catch errors at compile time
3. Handle errors appropriately in production code
4. Consider using environment variables for file paths and configuration
5. Add logging for better debugging and monitoring 