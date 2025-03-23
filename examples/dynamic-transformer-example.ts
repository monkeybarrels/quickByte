import { createDynamicTransformerPipeline } from '../src/data/transformers/dynamic.transformer';
import { DynamicTransformerConfigUnion } from '../src/data/transformers/dynamic.transformer';
import { DataTransformer, TransformerType, FilterOperator, MapOperation } from '../src/data/types';

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
            description: 'Maps CSV fields to MongoDB fields',
            fieldMap: {
                'first_name': 'firstName',
                'last_name': 'lastName'
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

    // Example data
    const inputData: UserData[] = [
        {
            userid: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'JOHN@EXAMPLE.COM',
            age: 30,
            status: 'active'
        },
        {
            userid: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'JANE@EXAMPLE.COM',
            age: 25,
            status: 'inactive'
        }
    ];

    // Transform the data
    const transformedData = pipeline.transformBatch(inputData);
    console.log('Transformed data:', transformedData);
}

// Run the example
dynamicTransformerExample().catch(console.error); 