import { DataFormat, DataSource } from '../src/types';
import { createDataTransformer } from '../src/transformers/data.transformer';
import { createCsvReader } from '../src/readers/csv.reader';
import { createCsvWriter } from '../src/writers/csv.writer';
import { promises as fs } from 'fs';

interface User {
    age: number;
    [key: string]: any;
}

async function main() {
    const csvContent = await fs.readFile('./data/input/users.csv', 'utf-8');
    
    const transformer = createDataTransformer<User, User>({
        reader: createCsvReader(),
        writer: createCsvWriter({
            type: DataSource.FILE,
            options: {
                path: './data/output/users2.csv',
                delimiter: ','
            }
        }),
        sourceConfig: {
            type: DataSource.FILE,
            location: './data/input/users.csv',
            options: {
                format: DataFormat.CSV,
                content: csvContent
            }
        },
        writerConfig: {
            type: DataSource.FILE,
            location: './data/output/users2.csv',
            options: {
                path: './data/output/users2.csv',
                format: DataFormat.CSV
            }
        },
        transform: (user: User) => ({
            ...user,
            age: user.age + 1,
        }),
    });

    await transformer.transform();
}

main().catch(console.error);    