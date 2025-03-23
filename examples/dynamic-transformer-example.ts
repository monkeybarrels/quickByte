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
                // Implement CSV write logic here
                // This is a placeholder - you'll need to implement actual CSV writing
                const fileWriter = new FileWriter(config as FileWriterConfig);
                await fileWriter.write(data, config);
            }
        },
        formatter: {
            format: async (data, config) => {
                // Implement CSV formatting logic here
                // This is a placeholder - you'll need to implement actual CSV formatting
                const csvFormatter = new CsvFormatter<UserData>(config);
                return csvFormatter.format(data, config);
            },
            parse: async (data, config) => {
                // Implement CSV parsing logic here
                // This is a placeholder - you'll need to implement actual CSV parsing
                return [];
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