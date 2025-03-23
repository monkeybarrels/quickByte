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
