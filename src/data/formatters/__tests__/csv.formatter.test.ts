import { CsvFormatter, createCsvFormatter } from '../csv.formatter';
import { CsvFormatterConfig, FormatConfig, DataError, DataFormat } from '../../types';

interface TestData {
    name: string;
    age: number;
    email: string;
}

describe('CsvFormatter', () => {
    let formatter: CsvFormatter<TestData>;
    const csvConfig: CsvFormatterConfig = {
        headers: ['name', 'age', 'email'],
        delimiter: ','
    };

    const formatConfig: FormatConfig = {
        type: DataFormat.CSV,
        options: csvConfig as unknown as Record<string, unknown>
    };

    beforeEach(() => {
        formatter = new CsvFormatter<TestData>(formatConfig);
    });

    describe('format', () => {
        it('should format data to CSV string', async () => {
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' },
                { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe('name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com');
        });

        it('should use custom delimiter when configured', async () => {
            const customFormatter = new CsvFormatter<TestData>({
                type: DataFormat.CSV,
                options: { headers: ['name', 'age', 'email'], delimiter: ';' } as unknown as Record<string, unknown>
            });
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: 'john@example.com' }
            ];

            const result = await customFormatter.format(data, {
                type: DataFormat.CSV,
                options: { headers: ['name', 'age', 'email'], delimiter: ';' } as unknown as Record<string, unknown>
            });
            expect(result).toBe('name;age;email\nJohn Doe;30;john@example.com');
        });

        it('should handle empty data array', async () => {
            const result = await formatter.format([], formatConfig);
            expect(result).toBe('');
        });

        it('should throw DataError when formatting fails', async () => {
            const circularData: any = {};
            circularData.self = circularData;

            await expect(formatter.format(circularData as TestData[], formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should handle undefined values in data', async () => {
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: undefined as unknown as string }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe('name,age,email\nJohn Doe,30,');
        });

        it('should handle null values in data', async () => {
            const data: TestData[] = [
                { name: 'John Doe', age: 30, email: null as unknown as string }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe('name,age,email\nJohn Doe,30,');
        });

        it('should throw DataError when headers are missing', async () => {
            const invalidConfig: FormatConfig = {
                type: DataFormat.CSV,
                options: {} as unknown as Record<string, unknown>
            };

            await expect(formatter.format([], invalidConfig))
                .rejects
                .toThrow('CSV headers are required');
        });
    });

    describe('parse', () => {
        it('should parse CSV string to data array', async () => {
            const csvString = 'name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25,jane@example.com';

            const result = await formatter.parse(csvString, formatConfig);
            expect(result).toEqual([
                { name: 'John Doe', age: 30, email: 'john@example.com' },
                { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
            ]);
        });

        it('should handle empty CSV string', async () => {
            const result = await formatter.parse('', formatConfig);
            expect(result).toEqual([]);
        });

        it('should throw DataError when parsing invalid CSV', async () => {
            const invalidCsv = 'name,age\nJohn Doe,30,extra\nJane Smith';

            await expect(formatter.parse(invalidCsv, formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should handle whitespace in CSV values', async () => {
            const csvString = 'name,age,email\n  John Doe  ,  30  ,  john@example.com  ';

            const result = await formatter.parse(csvString, formatConfig);
            expect(result).toEqual([
                { name: 'John Doe', age: 30, email: 'john@example.com' }
            ]);
        });

        it('should handle empty lines in CSV', async () => {
            const csvString = 'name,age,email\n\nJohn Doe,30,john@example.com\n\n';

            const result = await formatter.parse(csvString, formatConfig);
            expect(result).toEqual([
                { name: 'John Doe', age: 30, email: 'john@example.com' }
            ]);
        });

        it('should handle numeric values correctly', async () => {
            const csvString = 'name,age,email\nJohn Doe,30,john@example.com\nJane Smith,25.5,jane@example.com';

            const result = await formatter.parse(csvString, formatConfig);
            expect(result).toEqual([
                { name: 'John Doe', age: 30, email: 'john@example.com' },
                { name: 'Jane Smith', age: 25.5, email: 'jane@example.com' }
            ]);
        });

        it('should throw DataError when headers are missing in parse config', async () => {
            const invalidConfig: FormatConfig = {
                type: DataFormat.CSV,
                options: {} as unknown as Record<string, unknown>
            };

            await expect(formatter.parse('', invalidConfig))
                .rejects
                .toThrow('CSV headers are required');
        });

        it('should throw DataError when CSV has incorrect number of columns', async () => {
            const invalidCsv = 'name,age,email\nJohn Doe,30\nJane Smith,25,extra,column';

            await expect(formatter.parse(invalidCsv, formatConfig))
                .rejects
                .toThrow('Invalid CSV: Row');
        });
    });
});

describe('createCsvFormatter', () => {
    it('should create a CsvFormatter instance with default config', () => {
        const formatter = createCsvFormatter<TestData>({
            type: DataFormat.CSV,
            options: { headers: ['name', 'age', 'email'] } as unknown as Record<string, unknown>
        });
        expect(formatter).toBeInstanceOf(CsvFormatter);
    });

    it('should create a CsvFormatter instance with custom config', () => {
        const formatter = createCsvFormatter<TestData>({
            type: DataFormat.CSV,
            options: { headers: ['name', 'age', 'email'], delimiter: ';' } as unknown as Record<string, unknown>
        });
        expect(formatter).toBeInstanceOf(CsvFormatter);
    });
}); 