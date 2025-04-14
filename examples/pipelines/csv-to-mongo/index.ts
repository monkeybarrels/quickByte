// import { createCsvReader } from '../../../packages/@quickbyte/core/dist/src/readers/csv.reader';
// import { createMongoWriter } from '../../../packages/@quickbyte/core/dist/src/writers/mongo.writer';

import { DynamicTransformerConfigUnion, FilterOperator, MapOperation, TransformerType } from "../../../packages/@quickbyte/core/dist/src/types";

// const csvReader = createCsvReader({
//     path: './data/input/csv/data.csv',
//     format: 'csv',
// });


const transformerConfigs: DynamicTransformerConfigUnion[] = [
    {
        name: 'fieldMapper',
        description: 'Maps MongoDB fields to CSV fields',
        fieldMap: {
            'firstName': 'first_name',
            'lastName': 'last_name'
        },
        dropUnmapped: false
    },
    {
        name: 'activeUsers',
        description: 'Only includes active users',
        field: 'status',
        operator: FilterOperator.EQUALS,
        value: 'active',
        predicate: (item: any) => item.status === 'active'
    },
    {
        name: 'dataCleaner',
        description: 'Cleans and validates user data',
        field: 'email',
        operation: MapOperation.TO_LOWER_CASE,
        transform: (item: any) => ({
            ...item,
            email: item.email.toLowerCase(),
            age: Number(item.age)
        })
    }
];

console.log(JSON.stringify(transformerConfigs, null, 2));