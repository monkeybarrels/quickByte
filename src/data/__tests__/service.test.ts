import { DataServiceImpl, createDataService } from '../service';
import { DataReader, DataFormatter, SourceConfig, FormatConfig, DataError, DataServiceOptions, DataSource, DataFormat } from '../types';

// Mock data types for testing
interface TestData {
    id: number;
    name: string;
    value: number;
}

interface TestParams {
    filter?: string;
}

interface TestResult {
    total: number;
    items: TestData[];
}

describe('DataServiceImpl', () => {
    let mockReader: jest.Mocked<DataReader<TestData, TestParams>>;
    let mockFormatter: jest.Mocked<DataFormatter<TestData, TestResult>>;
    let service: DataServiceImpl<TestData, TestParams, TestResult>;

    const mockData: TestData[] = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 },
    ];

    const mockConfig: SourceConfig = {
        type: DataSource.FILE,
        location: 'test.json',
    };

    const mockFormat: FormatConfig = {
        type: DataFormat.JSON,
    };

    beforeEach(() => {
        mockReader = {
            read: jest.fn().mockResolvedValue(mockData),
            readStream: jest.fn(),
        };

        mockFormatter = {
            format: jest.fn().mockResolvedValue({
                total: mockData.length,
                items: mockData,
            }),
            parse: jest.fn(),
        };

        service = new DataServiceImpl(mockReader, mockFormatter);
    });

    describe('read', () => {
        it('should read and format data successfully', async () => {
            const result = await service.read(mockConfig, mockFormat);

            expect(mockReader.read).toHaveBeenCalledWith(mockConfig, undefined);
            expect(mockFormatter.format).toHaveBeenCalledWith(mockData, mockFormat);
            expect(result).toEqual({
                total: mockData.length,
                items: mockData,
            });
        });

        it('should apply transformation if provided', async () => {
            const transform: DataServiceOptions<TestData>['transform'] = (item) => ({
                ...item,
                value: item.value * 2,
            });

            service = new DataServiceImpl(mockReader, mockFormatter, { transform });

            await service.read(mockConfig, mockFormat);

            expect(mockFormatter.format).toHaveBeenCalledWith(
                mockData.map(item => ({ ...item, value: item.value * 2 })),
                mockFormat
            );
        });

        it('should validate data if validator is provided', async () => {
            const validate: DataServiceOptions<TestData>['validate'] = (item) => item.value > 0;
            service = new DataServiceImpl(mockReader, mockFormatter, { validate });

            await service.read(mockConfig, mockFormat);

            expect(mockFormatter.format).toHaveBeenCalledWith(mockData, mockFormat);
        });

        it('should throw DataError when validation fails', async () => {
            const validate: DataServiceOptions<TestData>['validate'] = (item) => item.value > 1000;
            service = new DataServiceImpl(mockReader, mockFormatter, { validate });

            await expect(service.read(mockConfig, mockFormat)).rejects.toThrow(DataError);
        });

        it('should filter data if filter is provided', async () => {
            const filter: DataServiceOptions<TestData>['filter'] = (item) => item.value > 150;
            service = new DataServiceImpl(mockReader, mockFormatter, { filter });

            await service.read(mockConfig, mockFormat);

            expect(mockFormatter.format).toHaveBeenCalledWith(
                mockData.filter(item => item.value > 150),
                mockFormat
            );
        });

        it('should handle reader errors', async () => {
            const error = new Error('Reader error');
            mockReader.read.mockRejectedValue(error);

            await expect(service.read(mockConfig, mockFormat)).rejects.toThrow(DataError);
        });

        it('should handle formatter errors', async () => {
            const error = new Error('Formatter error');
            mockFormatter.format.mockRejectedValue(error);

            await expect(service.read(mockConfig, mockFormat)).rejects.toThrow(DataError);
        });

        it('should handle unknown errors', async () => {
            // Mock a non-Error object being thrown
            mockReader.read.mockRejectedValue('string error');

            const error = await service.read(mockConfig, mockFormat).catch(e => e);
            expect(error).toBeInstanceOf(DataError);
            expect(error.message).toBe('Data service operation failed: Unknown error');
            expect(error.source).toBe(mockConfig.type);
            expect(error.code).toBe('SERVICE_ERROR');
        });
    });

    describe('readStream', () => {
        it('should read and format stream data', async () => {
            const mockStream = {
                async *[Symbol.asyncIterator]() {
                    for (const item of mockData) {
                        yield item;
                    }
                }
            };

            mockReader.readStream = jest.fn().mockResolvedValue(mockStream);

            const stream = await service.readStream(mockConfig, mockFormat);
            const results: TestResult[] = [];

            for await (const result of stream) {
                results.push(result);
            }

            expect(results).toHaveLength(mockData.length);
            expect(mockFormatter.format).toHaveBeenCalledTimes(mockData.length);
        });
    });
});

describe('createDataService', () => {
    it('should create a DataServiceImpl instance', () => {
        const mockReader: DataReader<TestData> = {
            read: jest.fn(),
        };

        const mockFormatter: DataFormatter<TestData, TestResult> = {
            format: jest.fn(),
            parse: jest.fn(),
        };

        const service = createDataService(mockReader, mockFormatter);

        expect(service).toBeInstanceOf(DataServiceImpl);
        expect(service.reader).toBe(mockReader);
        expect(service.formatter).toBe(mockFormatter);
    });
}); 