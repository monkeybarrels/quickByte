import { createDataService } from '../src/service';
import { createMongoReader } from '../src/readers/mongo.reader';
import { createJsonFormatter } from '../src/formatters/json.formatter';
import { DataSource, DataFormat } from '../src/types';

// Define your data type
interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
}

// Create a MongoDB reader
const reader = createMongoReader<Product>({
    connection: {
        uri: 'mongodb://localhost:27017',
        database: 'quickbyte',
        collection: 'products'
    },
    query: { inStock: true }, // Optional query filter
    options: { sort: { price: 1 } } // Optional query options
});

// Create a JSON formatter
const formatter = createJsonFormatter<Product>();

// Create the service
const service = createDataService<Product>(reader, formatter);

// Use it!
(async () => {
    try {
        // Read all in-stock products
        const products = await service.read(
            { type: DataSource.MONGODB, location: 'products' },
            { type: DataFormat.JSON, options: { pretty: true } }
        );
        console.log('Products:', products);

        // Stream products
        if (service.readStream) {
            const productStream = await service.readStream(
                { type: DataSource.MONGODB, location: 'products' },
                { type: DataFormat.JSON, options: { pretty: true } }
            );

            for await (const product of productStream) {
                console.log('Streamed product:', product);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
})(); 