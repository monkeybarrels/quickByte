import { DataReader, FileReaderConfig, SourceConfig, DataError } from '../types';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

export class FileReader<T> implements DataReader<T> {
    private config: FileReaderConfig;

    constructor(config: FileReaderConfig) {
        this.config = config;
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const content = await fs.readFile(this.config.path, {
                encoding: (this.config.encoding || 'utf-8') as BufferEncoding
            });
            return JSON.parse(content) as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Failed to read file: ${error.message}`,
                    'file',
                    'READ_ERROR',
                    error
                );
            }
            throw new DataError(
                'Failed to read file: Unknown error',
                'file',
                'READ_ERROR'
            );
        }
    }

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

export function createFileReader<T>(config: FileReaderConfig): FileReader<T> {
    return new FileReader<T>(config);
} 