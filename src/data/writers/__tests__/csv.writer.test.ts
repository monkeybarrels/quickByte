import { promises as fs } from 'fs';
import { CsvWriter, createCsvWriter } from '../csv.writer';
import { DataError, DataFormat } from '../../types';

// Mock fs promises
jest.mock('fs', () => ({
    promises: {
        writeFile: jest.fn(),
    },
}));

describe('CsvWriter', () => {
    const mockData = [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
    ];

    const defaultConfig = {
        type: DataFormat.CSV,
        options: {
            path: 'test.csv',
            encoding: 'utf-8' as BufferEncoding,
            append: false,
            delimiter: ',',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('write', () => {
        it('should write data to CSV file with default settings', async () => {
            const writer = createCsvWriter(defaultConfig);
            await writer.write(mockData, defaultConfig);

            const expectedContent = 'id,name,age\n1,John,30\n2,Jane,25';
            expect(fs.writeFile).toHaveBeenCalledWith(
                'test.csv',
                expectedContent,
                { encoding: 'utf-8', flag: 'w' }
            );
        });

        it('should write data with custom delimiter', async () => {
            const writer = createCsvWriter(defaultConfig);
            const config = {
                type: DataFormat.CSV,
                options: {
                    ...defaultConfig.options,
                    delimiter: ';',
                },
            };
            await writer.write(mockData, config);

            const expectedContent = 'id;name;age\n1;John;30\n2;Jane;25';
            expect(fs.writeFile).toHaveBeenCalledWith(
                'test.csv',
                expectedContent,
                { encoding: 'utf-8', flag: 'w' }
            );
        });

        it('should append data when append flag is true', async () => {
            const writer = createCsvWriter(defaultConfig);
            const config = {
                type: DataFormat.CSV,
                options: {
                    ...defaultConfig.options,
                    append: true,
                },
            };
            await writer.write(mockData, config);

            expect(fs.writeFile).toHaveBeenCalledWith(
                'test.csv',
                expect.any(String),
                { encoding: 'utf-8', flag: 'a' }
            );
        });

        it('should throw DataError when write fails', async () => {
            const error = new Error('Write failed');
            (fs.writeFile as jest.Mock).mockRejectedValueOnce(error);

            const writer = createCsvWriter(defaultConfig);
            await expect(writer.write(mockData, defaultConfig)).rejects.toThrow(DataError);
        });
    });

    describe('writeStream', () => {
        it('should write stream data to CSV file', async () => {
            const writer = createCsvWriter(defaultConfig);
            const asyncData = async function* () {
                yield mockData[0];
                yield mockData[1];
            };

            await writer.writeStream(asyncData(), defaultConfig);

            expect(fs.writeFile).toHaveBeenCalledTimes(3); // Headers + 2 rows
            const calls = (fs.writeFile as jest.Mock).mock.calls;
            expect(calls[0][1]).toBe('id,name,age\n');
            expect(calls[1][1]).toBe('1,John,30\n');
            expect(calls[2][1]).toBe('2,Jane,25\n');
        });

        it('should handle empty stream', async () => {
            const writer = createCsvWriter(defaultConfig);
            const asyncData = async function* () {};

            await writer.writeStream(asyncData(), defaultConfig);
            expect(fs.writeFile).not.toHaveBeenCalled();
        });

        it('should throw DataError when stream write fails', async () => {
            const error = new Error('Stream write failed');
            (fs.writeFile as jest.Mock).mockRejectedValueOnce(error);

            const writer = createCsvWriter(defaultConfig);
            const asyncData = async function* () {
                yield mockData[0];
            };

            await expect(writer.writeStream(asyncData(), defaultConfig)).rejects.toThrow(DataError);
        });
    });
}); 