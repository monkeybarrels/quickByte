import { DataReader, MongoReaderConfig, SourceConfig, DataError } from '../types';
import { MongoClient } from 'mongodb';

/**
 * A data reader implementation for MongoDB that supports both batch and streaming reads.
 * This class handles MongoDB connections and provides methods to read data from MongoDB collections.
 * 
 * @template T - The type of data being read from MongoDB
 */
export class MongoReader<T> implements DataReader<T> {
    private config: MongoReaderConfig;
    private client: MongoClient;

    /**
     * Creates a new MongoReader instance.
     * 
     * @param config - Configuration object containing MongoDB connection details and query options
     */
    constructor(config: MongoReaderConfig) {
        this.config = config;
        this.client = new MongoClient(config.connection.uri, config.connection.options);
    }

    /**
     * Reads data from MongoDB in a batch format.
     * 
     * @param config - Source configuration (not used in MongoDB implementation)
     * @param params - Optional parameters for the read operation
     * @returns Promise resolving to an array of documents
     * @throws {DataError} When MongoDB query fails
     */
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

    /**
     * Reads data from MongoDB as a stream.
     * 
     * @param config - Source configuration (not used in MongoDB implementation)
     * @param params - Optional parameters for the read operation
     * @returns Promise resolving to an AsyncIterable of documents
     */
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

/**
 * Factory function to create a new MongoReader instance.
 * 
 * @template T - The type of data being read from MongoDB
 * @param config - Configuration object containing MongoDB connection details and query options
 * @returns A new MongoReader instance
 */
export function createMongoReader<T>(config: MongoReaderConfig): MongoReader<T> {
    return new MongoReader<T>(config);
} 