import { DataReader, StreamReaderConfig, SourceConfig, DataError } from '../types';
import { Readable } from 'stream';

export class StreamReader<T> implements DataReader<T> {
    private config: StreamReaderConfig;

    constructor(config: StreamReaderConfig) {
        this.config = config;
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const chunks: Buffer[] = [];
            for await (const chunk of this.config.stream) {
                chunks.push(Buffer.from(chunk));
            }
            const content = Buffer.concat(chunks).toString(this.config.encoding || 'utf-8');
            return JSON.parse(content) as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Stream reading failed: ${error.message}`,
                    'stream',
                    'STREAM_ERROR',
                    error
                );
            }
            throw new DataError(
                'Stream reading failed: Unknown error',
                'stream',
                'STREAM_ERROR'
            );
        }
    }

    readStream(config: SourceConfig, params?: unknown): AsyncIterable<T> {
        return {
            async *[Symbol.asyncIterator]() {
                for await (const chunk of this.config.stream) {
                    const lines = chunk.toString(this.config.encoding || 'utf-8').split('\n');
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

export function createStreamReader<T>(config: StreamReaderConfig): StreamReader<T> {
    return new StreamReader<T>(config);
} 