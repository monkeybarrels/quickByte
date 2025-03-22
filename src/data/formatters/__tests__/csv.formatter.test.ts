import { CsvFormatter, createCsvFormatter } from '../csv.formatter';
import { CsvFormatterConfig, FormatConfig, DataError } from '../../types';

interface TestData {
    name: string;
    age: number;
    email: string;
}

describe('CsvFormatter', () => {
    const config: CsvFormatterConfig = {
        headers: ['name', 'age', 'email'],
        delimiter: ','
    };

    const formatConfig: FormatConfig = {
        type: 'csv'
    };

    let formatter: CsvFormatter<TestData>;

    beforeEach(() => {
        formatter = new CsvFormatter<TestData>(config);
    });

    describe('format', () => {
        it('should format empty array to header-only CSV', async () => {
            const result = await formatter.format([], formatConfig);
            expect(result).toBe('name,age,email');
        });

        it('should format data array to CSV with headers', async () => {
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' },
                { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
            ];

            const expected = 'name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com';
            const result = await formatter.format(data, formatConfig);
            expect(result).toBe(expected);
        });

        it('should handle missing values', async () => {
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: '' },
                { name: '', age: 25, email: 'jane@example.com' }
            ];

            const expected = 'name,age,email\nJohn Doe,30,\n,25,jane@example.com';
            const result = await formatter.format(data, formatConfig);
            expect(result).toBe(expected);
        });

        it('should use custom delimiter when provided', async () => {
            const customFormatter = new CsvFormatter<TestData>({
                ...config,
                delimiter: ';'
            });

            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' }
            ];

            const expected = 'name;age;email\nJohn Doe;30;john@example.com';
            const result = await customFormatter.format(data, formatConfig);
            expect(result).toBe(expected);
        });
    });

    describe('parse', () => {
        it('should parse empty CSV to empty array', async () => {
            const result = await formatter.parse('name,age,email', formatConfig);
            expect(result).toEqual([]);
        });

        it('should parse CSV with data to array of objects', async () => {
            const csv = 'name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com';
            const result = await formatter.parse(csv, formatConfig);
            
            // Convert string ages to numbers for comparison
            const expected: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' },
                { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
            ];
            
            expect(result.map(item => ({
                ...item,
                age: Number(item.age)
            }))).toEqual(expected);
        });

        it('should handle empty values', async () => {
            const csv = 'name,age,email\nJohn Doe,30,\n,25,jane@example.com';
            const result = await formatter.parse(csv, formatConfig);
            
            // Convert string ages to numbers for comparison
            const expected: TestData[] = [
                { name: 'John Doe', age: 30, email: '' },
                { name: '', age: 25, email: 'jane@example.com' }
            ];
            
            expect(result.map(item => ({
                ...item,
                age: Number(item.age)
            }))).toEqual(expected);
        });

        it('should use custom delimiter when provided', async () => {
            const customFormatter = new CsvFormatter<TestData>({
                ...config,
                delimiter: ';'
            });

            const csv = 'name;age;email\nJohn Doe;30;john@example.com';
            const result = await customFormatter.parse(csv, formatConfig);
            
            // Convert string ages to numbers for comparison
            const expected: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' }
            ];
            
            expect(result.map(item => ({
                ...item,
                age: Number(item.age)
            }))).toEqual(expected);
        });
    });

    describe('error handling', () => {
        it('should handle malformed data gracefully', async () => {
            const invalidData = [{ invalid: 'data' }] as unknown as TestData[];
            const result = await formatter.format(invalidData, formatConfig);
            expect(result).toBe('name,age,email\n,,');
        });

        it('should handle malformed CSV gracefully', async () => {
            const invalidCsv = 'invalid,csv,format\nincomplete,row';
            const result = await formatter.parse(invalidCsv, formatConfig);
            expect(result).toEqual([{
                invalid: 'incomplete',
                csv: 'row',
                format: ''
            }]);
        });
    });

    describe('createCsvFormatter', () => {
        it('should create a new CsvFormatter instance', () => {
            const formatter = createCsvFormatter<TestData>(config);
            expect(formatter).toBeInstanceOf(CsvFormatter);
        });
    });
}); 