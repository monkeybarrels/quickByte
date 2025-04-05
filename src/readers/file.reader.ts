import { DataReader, FileReaderConfig, SourceConfig, DataError, DataFormat, DataSource } from '../types';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

/**
 * A class that implements DataReader interface to read data from files.
 * Supports both synchronous file reading and streaming.
 * @template T - The type of data being read from the file
 */
export class FileReader<T> implements DataReader<T> {
    private config: FileReaderConfig;

    /**
     * Creates a new FileReader instance.
     * @param config - Configuration object containing file path and encoding settings
     */
    constructor(config: FileReaderConfig) {
        this.config = config;
    }

    /**
     * Reads the entire file content and returns it as an array of type T.
     * @param config - Source configuration (unused in this implementation)
     * @param params - Optional parameters (unused in this implementation)
     * @returns Promise resolving to an array of type T
     * @throws {DataError} When file reading or parsing fails
     */
    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const content = await fs.readFile(this.config.path, {
                encoding: (this.config.encoding || 'utf-8') as BufferEncoding
            });
            if(this.config.format === DataFormat.JSON) {
                return JSON.parse(content) as T[];
            } else if(this.config.format === DataFormat.CSV) {
                return content.split('\n').map(line => line.split(this.config.delimiter || ',')) as T[];
            }
            return [] as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Failed to read file: ${error.message}`,
                    DataSource.FILE,
                    'READ_ERROR',
                    error
                );
            }
            throw new DataError(
                'Failed to read file: Unknown error',
                DataSource.FILE,
                'READ_ERROR'
            );
        }
    }

    /**
     * Reads the file as a stream and yields parsed JSON objects of type T.
     * @param config - Source configuration (unused in this implementation)
     * @param params - Optional parameters (unused in this implementation)
     * @returns Promise resolving to an AsyncIterable that yields objects of type T
     */
    async readStream(config: SourceConfig, params?: unknown): Promise<AsyncIterable<T>> {
        const fileConfig = this.config;
        return Promise.resolve({
            async *[Symbol.asyncIterator]() {
                const stream = createReadStream(fileConfig.path, {
                    encoding: (fileConfig.encoding || 'utf-8') as BufferEncoding
                });

                for await (const chunk of stream) {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            yield JSON.parse(line) as T;
                        }
                    }
                }
            }
        });
    }
}

/**
 * Factory function to create a new FileReader instance.
 * @template T - The type of data being read from the file
 * @param config - Configuration object containing file path and encoding settings
 * @returns A new FileReader instance
 */
export function createFileReader<T>(config: FileReaderConfig): FileReader<T> {
    return new FileReader<T>(config);
} 