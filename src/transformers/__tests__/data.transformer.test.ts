import { createDataTransformer } from '../data.transformer';
import { DataReader, DataWriter, DataFormatter, DataSource, DataFormat, SourceConfig, WriterConfig, FormatConfig } from '../../types';

// Mock interfaces
interface TestInput {
    id: number;
    name: string;
}

interface TestOutput {
    id: string;
    fullName: string;
}

describe('DataTransformer', () => {
    // Mock implementations
    const mockReader: DataReader<TestInput> = {
        read: jest.fn().mockResolvedValue([
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
        ])
    };

    const mockWriter: DataWriter<TestOutput> = {
        write: jest.fn().mockResolvedValue(undefined)
    };

    const mockFormatter: DataFormatter<TestOutput> = {
        format: jest.fn().mockResolvedValue('formatted data'),
        parse: jest.fn()
    };

    const sourceConfig: SourceConfig = {
        type: DataSource.FILE,
        location: 'test.csv'
    };

    const writerConfig: WriterConfig = {
        type: DataSource.FILE,
        location: 'output.csv',
        options: { path: 'output.csv' }
    };

    const formatterConfig: FormatConfig = {
        type: DataFormat.CSV,
        options: { headers: ['id', 'fullName'] }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should transform data without formatter', async () => {
        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: mockReader,
            writer: mockWriter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig
        });

        await transformer.transform();

        expect(mockReader.read).toHaveBeenCalledWith(sourceConfig);
        expect(mockWriter.write).toHaveBeenCalledWith(
            [
                { id: '1', fullName: 'John' },
                { id: '2', fullName: 'Jane' }
            ],
            writerConfig
        );
    });

    it('should transform data with formatter', async () => {
        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: mockReader,
            writer: mockWriter,
            formatter: mockFormatter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig,
            formatterConfig
        });

        await transformer.transform();

        expect(mockReader.read).toHaveBeenCalledWith(sourceConfig);
        expect(mockFormatter.format).toHaveBeenCalledWith(
            [
                { id: '1', fullName: 'John' },
                { id: '2', fullName: 'Jane' }
            ],
            formatterConfig
        );
        expect(mockWriter.write).toHaveBeenCalledWith(
            ['formatted data'],
            writerConfig
        );
    });

    it('should handle empty input data', async () => {
        const emptyReader: DataReader<TestInput> = {
            read: jest.fn().mockResolvedValue([])
        };

        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: emptyReader,
            writer: mockWriter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig
        });

        await transformer.transform();

        expect(emptyReader.read).toHaveBeenCalledWith(sourceConfig);
        expect(mockWriter.write).toHaveBeenCalledWith([], writerConfig);
    });

    it('should handle reader errors', async () => {
        const errorReader: DataReader<TestInput> = {
            read: jest.fn().mockRejectedValue(new Error('Read error'))
        };

        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: errorReader,
            writer: mockWriter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig
        });

        await expect(transformer.transform()).rejects.toThrow('Read error');
    });

    it('should handle writer errors', async () => {
        const errorWriter: DataWriter<TestOutput> = {
            write: jest.fn().mockRejectedValue(new Error('Write error'))
        };

        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: mockReader,
            writer: errorWriter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig
        });

        await expect(transformer.transform()).rejects.toThrow('Write error');
    });

    it('should handle formatter errors', async () => {
        const errorFormatter: DataFormatter<TestOutput> = {
            format: jest.fn().mockRejectedValue(new Error('Format error')),
            parse: jest.fn()
        };

        const transformer = createDataTransformer<TestInput, TestOutput>({
            reader: mockReader,
            writer: mockWriter,
            formatter: errorFormatter,
            transform: (input) => ({
                id: input.id.toString(),
                fullName: input.name
            }),
            sourceConfig,
            writerConfig,
            formatterConfig
        });

        await expect(transformer.transform()).rejects.toThrow('Format error');
    });
}); 