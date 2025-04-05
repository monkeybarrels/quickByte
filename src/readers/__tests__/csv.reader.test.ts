import { CsvReader, createCsvReader } from '../csv.reader';
import { DataError, DataSource, DataFormat } from '../../types';

interface TestData {
    name: string;
    age: string;
    city: string;
}

describe('CsvReader', () => {
    let reader: CsvReader<TestData>;

    beforeEach(() => {
        reader = new CsvReader<TestData>({
            path: 'test.csv',
            format: DataFormat.CSV,
            delimiter: ','
        });
    });

    describe('read', () => {
        it('should successfully parse CSV data', async () => {
            const csvContent = 'name,age,city\nJohn,30,New York\nJane,25,London';
            const result = await reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: { content: csvContent }
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'John',
                age: '30',
                city: 'New York'
            });
            expect(result[1]).toEqual({
                name: 'Jane',
                age: '25',
                city: 'London'
            });
        });

        it('should handle empty lines', async () => {
            const csvContent = 'name,age,city\nJohn,30,New York\n\nJane,25,London';
            const result = await reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: { content: csvContent }
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'John',
                age: '30',
                city: 'New York'
            });
            expect(result[1]).toEqual({
                name: 'Jane',
                age: '25',
                city: 'London'
            });
        });

        it('should handle custom delimiters', async () => {
            const reader = new CsvReader<TestData>({
                path: 'test.csv',
                format: DataFormat.CSV,
                delimiter: ';'
            });

            const csvContent = 'name;age;city\nJohn;30;New York\nJane;25;London';
            const result = await reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: { content: csvContent }
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'John',
                age: '30',
                city: 'New York'
            });
        });

        it('should handle missing values', async () => {
            const csvContent = 'name,age,city\nJohn,,New York\nJane,25,';
            const result = await reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: { content: csvContent }
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'John',
                age: '',
                city: 'New York'
            });
            expect(result[1]).toEqual({
                name: 'Jane',
                age: '25',
                city: ''
            });
        });

        it('should throw DataError when no content is provided', async () => {
            await expect(reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: {}
            })).rejects.toThrow(DataError);
            await expect(reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: {}
            })).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'CSV_ERROR'
            });
        });

        it('should handle malformed CSV data', async () => {
            const csvContent = 'name,age,city\nJohn,30,New York\nJane,25,London,extra';
            const result = await reader.read({
                type: DataSource.FILE,
                location: 'test.csv',
                options: { content: csvContent }
            });

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                name: 'John',
                age: '30',
                city: 'New York'
            });
            expect(result[1]).toEqual({
                name: 'Jane',
                age: '25',
                city: 'London'
            });
        });
    });
});

describe('createCsvReader', () => {
    it('should create a CsvReader with default config', () => {
        const reader = createCsvReader<TestData>();
        expect(reader).toBeInstanceOf(CsvReader);
    });

    it('should create a CsvReader with custom config', () => {
        const config = {
            path: 'test.csv',
            format: DataFormat.CSV,
            delimiter: ';'
        };
        const reader = createCsvReader<TestData>(config);
        expect(reader).toBeInstanceOf(CsvReader);
    });
}); 