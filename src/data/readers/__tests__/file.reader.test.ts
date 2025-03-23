/// <reference types="jest" />

import { promises as fs } from 'fs';
import { createFileReader } from '../file.reader';
import { DataError, DataSource, SourceConfig, DataFormat } from '../../types';
import { Readable } from 'stream';

// Mock fs promises
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
    },
    createReadStream: jest.fn(),
}));

describe('FileReader', () => {
    const mockConfig = {
        path: '/test/path/data.json',
        encoding: 'utf-8',
        format: DataFormat.JSON
    };

    const mockSourceConfig: SourceConfig = {
        type: DataSource.FILE,
        location: '/test/path/data.json',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('read method', () => {
        it('should successfully read and parse JSON file', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

            const reader = createFileReader(mockConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(fs.readFile).toHaveBeenCalledWith(mockConfig.path, {
                encoding: mockConfig.encoding,
            });
        });

        it('should use utf-8 encoding by default', async () => {
            const configWithoutEncoding = { 
                path: '/test/path/data.json',
                format: DataFormat.JSON
            };
            const mockData = [{ id: 1, name: 'Test' }];
            (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

            const reader = createFileReader(configWithoutEncoding);
            await reader.read(mockSourceConfig);

            expect(fs.readFile).toHaveBeenCalledWith(configWithoutEncoding.path, {
                encoding: 'utf-8',
            });
        });

        it('should throw DataError when file read fails', async () => {
            const mockError = new Error('File not found');
            (fs.readFile as jest.Mock).mockRejectedValue(mockError);

            const reader = createFileReader(mockConfig);
            await expect(reader.read(mockSourceConfig)).rejects.toThrow(DataError);
            await expect(reader.read(mockSourceConfig)).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'READ_ERROR',
                message: expect.stringContaining('Failed to read file'),
            });
        });

        it('should throw DataError when JSON parsing fails', async () => {
            (fs.readFile as jest.Mock).mockResolvedValue('invalid json');

            const reader = createFileReader(mockConfig);
            await expect(reader.read(mockSourceConfig)).rejects.toThrow(DataError);
        });

        it('should handle CSV format with default delimiter', async () => {
            const csvConfig = {
                path: '/test/path/data.csv',
                format: DataFormat.CSV
            };
            const mockData = 'id,name\n1,Test1\n2,Test2';
            (fs.readFile as jest.Mock).mockResolvedValue(mockData);

            const reader = createFileReader(csvConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual([
                ['id', 'name'],
                ['1', 'Test1'],
                ['2', 'Test2']
            ]);
        });

        it('should handle CSV format with custom delimiter', async () => {
            const csvConfig = {
                path: '/test/path/data.csv',
                format: DataFormat.CSV,
                delimiter: '|'
            };
            const mockData = 'id|name\n1|Test1\n2|Test2';
            (fs.readFile as jest.Mock).mockResolvedValue(mockData);

            const reader = createFileReader(csvConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual([
                ['id', 'name'],
                ['1', 'Test1'],
                ['2', 'Test2']
            ]);
        });

        it('should handle unknown error types', async () => {
            (fs.readFile as jest.Mock).mockRejectedValue('string error');

            const reader = createFileReader(mockConfig);
            await expect(reader.read(mockSourceConfig)).rejects.toThrow(DataError);
            await expect(reader.read(mockSourceConfig)).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'READ_ERROR',
                message: 'Failed to read file: Unknown error'
            });
        });

        it('should return empty array for unknown format', async () => {
            const unknownConfig = {
                path: '/test/path/data.txt',
                format: 'UNKNOWN' as DataFormat
            };
            (fs.readFile as jest.Mock).mockResolvedValue('some content');

            const reader = createFileReader(unknownConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual([]);
        });
    });

    describe('readStream method', () => {
        it('should successfully stream and parse JSON lines', async () => {
            const mockReadable = new Readable({
                read() {}
            });
            const mockData = [
                { id: 1, name: 'Test1' },
                { id: 2, name: 'Test2' },
            ];
            
            (require('fs').createReadStream as jest.Mock).mockReturnValue(mockReadable);
            
            const reader = createFileReader(mockConfig);
            const stream = await reader.readStream(mockSourceConfig);
            
            // Push mock data to the stream
            process.nextTick(() => {
                mockReadable.push(JSON.stringify(mockData[0]) + '\n');
                mockReadable.push(JSON.stringify(mockData[1]) + '\n');
                mockReadable.push(null);
            });

            const results: Array<{ id: number; name: string }> = [];
            for await (const item of stream) {
                results.push(item as { id: number; name: string });
            }

            expect(results).toEqual(mockData);
        });

        it('should skip empty lines in the stream', async () => {
            const mockReadable = new Readable({
                read() {}
            });
            const mockData = { id: 1, name: 'Test1' };
            
            (require('fs').createReadStream as jest.Mock).mockReturnValue(mockReadable);
            
            const reader = createFileReader(mockConfig);
            const stream = await reader.readStream(mockSourceConfig);
            
            process.nextTick(() => {
                mockReadable.push('\n');
                mockReadable.push(JSON.stringify(mockData) + '\n');
                mockReadable.push('   \n');
                mockReadable.push(null);
            });

            const results: Array<{ id: number; name: string }> = [];
            for await (const item of stream) {
                results.push(item as { id: number; name: string });
            }

            expect(results).toEqual([mockData]);
        });
    });

    describe('createFileReader factory', () => {
        it('should create a new FileReader instance', () => {
            const reader = createFileReader(mockConfig);
            expect(reader).toBeDefined();
            expect(reader).toHaveProperty('read');
            expect(reader).toHaveProperty('readStream');
        });
    });
}); 