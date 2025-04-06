import { JsonFormatter, createJsonFormatter } from '../json.formatter';
import { DataError, FormatConfig, DataFormat } from '../../types';

interface TestData {
    id: number;
    name: string;
    optional?: string;
    nested?: {
        value: number;
    };
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

        it('should handle empty data array', async () => {
            const result = await formatter.format([], formatConfig);
            expect(result).toBe('[]');
        });

        it('should handle data with optional fields', async () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1', optional: 'value' },
                { id: 2, name: 'Test 2' }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe(JSON.stringify(data));
        });

        it('should handle nested objects', async () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1', nested: { value: 42 } },
                { id: 2, name: 'Test 2' }
            ];

            const result = await formatter.format(data, formatConfig);
            expect(result).toBe(JSON.stringify(data));
        });

        it('should throw DataError when formatting fails', async () => {
            const circularData: any = {};
            circularData.self = circularData;

            await expect(formatter.format(circularData as TestData[], formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should handle undefined options', async () => {
            const data: TestData[] = [
                { id: 1, name: 'Test 1' }
            ];
            const config: FormatConfig = { 
                type: DataFormat.JSON,
                options: undefined
            };

            const result = await formatter.format(data, config);
            expect(result).toBe(JSON.stringify(data));
        });

        it('should throw DataError with correct error details when formatting fails', async () => {
            const circularData: any = {};
            circularData.self = circularData;

            try {
                await formatter.format(circularData as TestData[], formatConfig);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DataError);
                if (error instanceof DataError) {
                    expect(error.source).toBe(DataFormat.JSON);
                    expect(error.code).toBe('JSON_FORMAT_ERROR');
                    expect(error.message).toContain('Failed to format JSON');
                    expect(error.details).toBeDefined();
                }
            }
        });

        it('should throw DataError with non-Error exception details', async () => {
            // Mock JSON.stringify to throw a non-Error exception
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockImplementation(() => {
                throw 'string error';
            });

            try {
                await formatter.format([{ id: 1, name: 'Test 1' }], formatConfig);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DataError);
                if (error instanceof DataError) {
                    expect(error.source).toBe(DataFormat.JSON);
                    expect(error.code).toBe('JSON_FORMAT_ERROR');
                    expect(error.message).toContain('Unknown error');
                    expect(error.details).toBeUndefined();
                }
            } finally {
                // Restore original JSON.stringify
                JSON.stringify = originalStringify;
            }
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

        it('should handle empty JSON array', async () => {
            const result = await formatter.parse('[]', formatConfig);
            expect(result).toEqual([]);
        });

        it('should handle JSON with optional fields', async () => {
            const jsonString = JSON.stringify([
                { id: 1, name: 'Test 1', optional: 'value' },
                { id: 2, name: 'Test 2' }
            ]);

            const result = await formatter.parse(jsonString, formatConfig);
            expect(result).toEqual([
                { id: 1, name: 'Test 1', optional: 'value' },
                { id: 2, name: 'Test 2' }
            ]);
        });

        it('should handle JSON with nested objects', async () => {
            const jsonString = JSON.stringify([
                { id: 1, name: 'Test 1', nested: { value: 42 } },
                { id: 2, name: 'Test 2' }
            ]);

            const result = await formatter.parse(jsonString, formatConfig);
            expect(result).toEqual([
                { id: 1, name: 'Test 1', nested: { value: 42 } },
                { id: 2, name: 'Test 2' }
            ]);
        });

        it('should throw DataError when parsing invalid JSON', async () => {
            const invalidJson = '{invalid json}';

            await expect(formatter.parse(invalidJson, formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should throw DataError when parsing non-array JSON', async () => {
            const nonArrayJson = '{"id": 1, "name": "Test 1"}';

            await expect(formatter.parse(nonArrayJson, formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should throw DataError when parsing null', async () => {
            await expect(formatter.parse('null', formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should throw DataError when parsing undefined', async () => {
            await expect(formatter.parse('undefined', formatConfig))
                .rejects
                .toThrow(DataError);
        });

        it('should throw DataError with correct error details when parsing fails', async () => {
            const invalidJson = '{invalid json}';

            try {
                await formatter.parse(invalidJson, formatConfig);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DataError);
                if (error instanceof DataError) {
                    expect(error.source).toBe(DataFormat.JSON);
                    expect(error.code).toBe('JSON_PARSE_ERROR');
                    expect(error.message).toContain('Failed to parse JSON');
                    expect(error.details).toBeDefined();
                }
            }
        });

        it('should throw DataError with correct error details when parsing non-array', async () => {
            const nonArrayJson = '{"id": 1, "name": "Test 1"}';

            try {
                await formatter.parse(nonArrayJson, formatConfig);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DataError);
                if (error instanceof DataError) {
                    expect(error.source).toBe(DataFormat.JSON);
                    expect(error.code).toBe('JSON_PARSE_ERROR');
                    expect(error.message).toContain('Parsed JSON must be an array');
                    expect(error.details).toBeDefined();
                }
            }
        });

        it('should throw DataError with non-Error exception details', async () => {
            // Mock JSON.parse to throw a non-Error exception
            const originalParse = JSON.parse;
            JSON.parse = jest.fn().mockImplementation(() => {
                throw 'string error';
            });

            try {
                await formatter.parse('[]', formatConfig);
                fail('Expected error to be thrown');
            } catch (error) {
                expect(error).toBeInstanceOf(DataError);
                if (error instanceof DataError) {
                    expect(error.source).toBe(DataFormat.JSON);
                    expect(error.code).toBe('JSON_PARSE_ERROR');
                    expect(error.message).toContain('Unknown error');
                    expect(error.details).toBeUndefined();
                }
            } finally {
                // Restore original JSON.parse
                JSON.parse = originalParse;
            }
        });
    });
});

describe('createJsonFormatter', () => {
    it('should create a JsonFormatter instance', () => {
        const formatter = createJsonFormatter<TestData>();
        expect(formatter).toBeInstanceOf(JsonFormatter);
    });

    it('should create independent formatter instances', () => {
        const formatter1 = createJsonFormatter<TestData>();
        const formatter2 = createJsonFormatter<TestData>();
        expect(formatter1).not.toBe(formatter2);
    });
}); 