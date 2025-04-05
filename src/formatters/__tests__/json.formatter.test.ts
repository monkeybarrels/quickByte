import { JsonFormatter, createJsonFormatter } from '../json.formatter';
import { DataError, FormatConfig, DataFormat } from '../../types';

interface TestData {
    id: number;
    name: string;
}

describe('JsonFormatter', () => {
    let formatter: JsonFormatter<TestData>;
    const formatConfig: FormatConfig = { type: DataFormat.JSON };

    beforeEach(() => {
        formatter = new JsonFormatter<TestData>();
    });

    describe('format', () => {
        it('should format data to JSON string', async () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe(JSON.stringify(data));
        });

        it('should format data with pretty printing when configured', async () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ];

            const prettyFormatter = new JsonFormatter<TestData>();
            const formatConfig: FormatConfig = { 
                type: DataFormat.JSON,
                options: { pretty: true }
            };
            const result = await prettyFormatter.format(data, formatConfig);
            expect(result).toBe(JSON.stringify(data, null, 2));
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
        it('should parse JSON string to data array', async () => {
            const jsonString = JSON.stringify([
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ]);

            const result = await formatter.parse(jsonString, formatConfig);
            expect(result).toEqual([
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' }
            ]);
        });

        it('should throw DataError when parsing invalid JSON', async () => {
            const invalidJson = '{invalid json}';

            await expect(formatter.parse(invalidJson, formatConfig))
                .rejects
                .toThrow(DataError);
        });
    });
});

describe('createJsonFormatter', () => {
    it('should create a JsonFormatter instance with default config', () => {
        const formatter = createJsonFormatter<TestData>();
        const formatConfig: FormatConfig = { 
            type: DataFormat.JSON,
            options: { pretty: true }
        };
        expect(formatter).toBeInstanceOf(JsonFormatter);
    });

    it('should create a JsonFormatter instance with custom config', () => {
        const formatter = createJsonFormatter<TestData>();
        const formatConfig: FormatConfig = { 
            type: DataFormat.JSON,
            options: { pretty: true }
        };
        expect(formatter).toBeInstanceOf(JsonFormatter);
    });
}); 