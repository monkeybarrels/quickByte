import { DataReader, StreamReaderConfig, SourceConfig, DataError, DataSource } from '../types';
import { Readable } from 'stream';

/**
 * A reader implementation that processes data from a stream, parsing JSON lines.
 * This reader supports both batch reading (all data at once) and streaming (line by line).
 * 
 * @template T - The type of data being read from the stream
 */
export class StreamReader<T> implements DataReader<T> {
    private config: StreamReaderConfig;

    /**
     * Creates a new StreamReader instance.
     * 
     * @param config - Configuration for the stream reader, including the stream and encoding
     */
    constructor(config: StreamReaderConfig) {
        this.config = config;
    }

    /**
     * Reads all data from the stream at once and returns it as an array.
     * 
     * @param config - Source configuration (unused in this implementation)
     * @param params - Optional parameters (unused in this implementation)
     * @returns Promise resolving to an array of parsed data items
     * @throws {DataError} If there's an error reading or parsing the stream
     */
    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const chunks: Buffer[] = [];
            for await (const chunk of this.config.stream) {
                chunks.push(chunk);
            }
            const content = Buffer.concat(chunks).toString(this.config.encoding as BufferEncoding || 'utf-8');
            return content.split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line) as T);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Stream reading failed: ${error.message}`,
                    DataSource.STREAM,
                    'STREAM_ERROR',
                    error
                );
            }
            throw new DataError(
                'Stream reading failed: Unknown error',
                DataSource.STREAM,
                'STREAM_ERROR'
            );
        }
    }

    /**
     * Reads data from the stream line by line, yielding parsed items as they become available.
     * This method is memory efficient as it processes the stream incrementally.
     * 
     * @param config - Source configuration (unused in this implementation)
     * @param params - Optional parameters (unused in this implementation)
     * @returns Promise resolving to an AsyncIterable that yields parsed data items
     */
    async readStream(config: SourceConfig, params?: unknown): Promise<AsyncIterable<T>> {
        const stream = this.config.stream;
        const encoding = this.config.encoding as BufferEncoding || 'utf-8';
        
        return {
            async *[Symbol.asyncIterator]() {
                for await (const chunk of stream) {
                    const lines = chunk.toString(encoding).split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            yield JSON.parse(line) as T;
                        }
                    }
                }
            }
        };
    }
}

/**
 * Factory function to create a new StreamReader instance.
 * 
 * @template T - The type of data being read from the stream
 * @param config - Configuration for the stream reader
 * @returns A new StreamReader instance
 */
export function createStreamReader<T>(config: StreamReaderConfig): StreamReader<T> {
    return new StreamReader<T>(config);
} 