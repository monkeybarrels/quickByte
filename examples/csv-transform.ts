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

        // Formatter configuration (optional)
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