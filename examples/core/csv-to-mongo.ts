import { createCsvReader } from '../../packages/@quickbyte/core/dist/src/readers/csv.reader';
import { createMongoFormatter } from '../../packages/@quickbyte/core/dist/src/formatters/mongo.formatter';
import { createFieldMappingTransformer, createFilterTransformer, createMapTransformer } from '../../packages/@quickbyte/core/dist/src/transformers/base.transformers';
import { createTransformerPipeline } from '../../packages/@quickbyte/core/dist/src/transformers/pipeline';
import { SourceConfig, FormatConfig, MongoConnection, DataSource, DataFormat, FilterOperator, MapOperation } from '../../packages/@quickbyte/core/dist/src/types';
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