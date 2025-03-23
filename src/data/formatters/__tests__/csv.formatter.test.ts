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