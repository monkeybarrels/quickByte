/// <reference types="jest" />

import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { createFileWriter } from '../file.writer';
import { DataError, DataSource } from '../../types';

// Mock fs promises and createWriteStream
jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn(),
        mkdir: jest.fn().mockResolvedValue(undefined)
    },
    createWriteStream: jest.fn(),
}));

describe('FileWriter', () => {
    const mockConfig = {
        type: DataSource.FILE,
        options: {
            path: '/test/path/data.json',
            encoding: 'utf-8' as BufferEncoding,
            append: false
        }
    };

    const testData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('write', () => {
        it('should successfully write data to file', async () => {
            const writer = createFileWriter(mockConfig);
            await writer.write(testData, mockConfig);

            expect(fs.writeFile).toHaveBeenCalledWith(
                mockConfig.options.path,
                JSON.stringify(testData, null, 2),
                {
                    encoding: mockConfig.options.encoding,
                    flag: 'w'
                }
            );
        });

        it('should append data when append flag is true', async () => {
            const appendConfig = {
                ...mockConfig,
                options: { ...mockConfig.options, append: true }
            };
            const writer = createFileWriter(appendConfig);
            await writer.write(testData, appendConfig);

            expect(fs.writeFile).toHaveBeenCalledWith(
                appendConfig.options.path,
                JSON.stringify(testData, null, 2),
                {
                    encoding: appendConfig.options.encoding,
                    flag: 'a'
                }
            );
        });

        it('should throw DataError when write fails', async () => {
            const mockError = new Error('Write failed');
            (fs.writeFile as jest.Mock).mockRejectedValue(mockError);

            const writer = createFileWriter(mockConfig);
            await expect(writer.write(testData, mockConfig)).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'WRITE_ERROR',
                message: expect.stringContaining('File writing failed')
            });
        });
    });

    describe('writeStream', () => {
        it('should successfully write stream data to file', async () => {
            const mockWriteStream = {
                write: jest.fn(),
                end: jest.fn()
            };
            (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

            const writer = createFileWriter(mockConfig);
            const asyncData = async function* () {
                yield testData[0];
                yield testData[1];
            };

            await writer.writeStream(asyncData(), mockConfig);

            expect(createWriteStream).toHaveBeenCalledWith(
                mockConfig.options.path,
                {
                    encoding: mockConfig.options.encoding,
                    flags: 'w'
                }
            );
            expect(mockWriteStream.write).toHaveBeenCalledTimes(2);
            expect(mockWriteStream.write).toHaveBeenNthCalledWith(1, JSON.stringify(testData[0]) + '\n');
            expect(mockWriteStream.write).toHaveBeenNthCalledWith(2, JSON.stringify(testData[1]) + '\n');
            expect(mockWriteStream.end).toHaveBeenCalled();
        });

        it('should append stream data when append flag is true', async () => {
            const appendConfig = {
                ...mockConfig,
                options: { ...mockConfig.options, append: true }
            };
            const mockWriteStream = {
                write: jest.fn(),
                end: jest.fn()
            };
            (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

            const writer = createFileWriter(appendConfig);
            const asyncData = async function* () {
                yield testData[0];
            };

            await writer.writeStream(asyncData(), appendConfig);

            expect(createWriteStream).toHaveBeenCalledWith(
                appendConfig.options.path,
                {
                    encoding: appendConfig.options.encoding,
                    flags: 'a'
                }
            );
        });

        it('should throw DataError when stream write fails', async () => {
            const mockError = new Error('Stream write failed');
            const mockWriteStream = {
                write: jest.fn().mockImplementation(() => {
                    throw mockError;
                }),
                end: jest.fn()
            };
            (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

            const writer = createFileWriter(mockConfig);
            const asyncData = async function* () {
                yield testData[0];
            };

            await expect(writer.writeStream(asyncData(), mockConfig)).rejects.toThrow(DataError);
            await expect(writer.writeStream(asyncData(), mockConfig)).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'WRITE_ERROR',
                message: expect.stringContaining('File stream writing failed')
            });
        });
    });
}); 