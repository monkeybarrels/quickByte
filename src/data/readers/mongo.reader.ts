import { DataReader, MongoReaderConfig, SourceConfig, DataError } from '../types';
import { MongoClient } from 'mongodb';

export class MongoReader<T> implements DataReader<T> {
    private config: MongoReaderConfig;
    private client: MongoClient;

    constructor(config: MongoReaderConfig) {
        this.config = config;
        this.client = new MongoClient(config.connection.uri, config.connection.options);
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            await this.client.connect();
            const collection = this.client
                .db(this.config.connection.database)
                .collection(this.config.connection.collection);
            
            const query = this.config.query || {};
            const cursor = collection.find(query, this.config.options);
            return await cursor.toArray() as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `MongoDB query failed: ${error.message}`,
                    'mongodb',
                    'MONGO_ERROR',
                    error
                );
            }
            throw new DataError(
                'MongoDB query failed: Unknown error',
                'mongodb',
                'MONGO_ERROR'
            );
        } finally {
            await this.client.close();
        }
    }

    async readStream(config: SourceConfig, params?: unknown): Promise<AsyncIterable<T>> {
        const client = await this.client.connect();
        const collection = client
            .db(this.config.connection.database)
            .collection(this.config.connection.collection);

        const query = this.config.query || {};
        const cursor = collection.find(query, this.config.options);

        return {
            async *[Symbol.asyncIterator]() {
                try {
                    for await (const doc of cursor) {
                        yield doc as T;
                    }
                } finally {
                    await client.close();
                }
            }
        };
    }
}

export function createMongoReader<T>(config: MongoReaderConfig): MongoReader<T> {
    return new MongoReader<T>(config);
} 