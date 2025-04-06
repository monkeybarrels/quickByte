import { DataFormatter, FormatConfig, MongoConnection, DataError, DataFormat } from '../types';
import { MongoClient } from 'mongodb';

export class MongoFormatter<T> implements DataFormatter<T> {
    private config: FormatConfig;
    private client: MongoClient | null = null;

    constructor(config: FormatConfig) {
        this.config = config;
    }

    private async getConnection(): Promise<MongoClient> {
        if (!this.client) {
            const mongoConfig = this.config.options?.connection as MongoConnection;
            this.client = new MongoClient(mongoConfig.uri, mongoConfig.options);
        }
        return this.client;
    }

    async format(data: T[], config: FormatConfig): Promise<void> {
        try {
            const client = await this.getConnection();
            const mongoConfig = config.options?.connection as MongoConnection;
            
            await client.connect();
            const db = client.db(mongoConfig.database);
            const collection = db.collection(mongoConfig.collection);

            // Convert data to MongoDB documents
            const documents = data.map(item => ({
                ...item,
                _id: (item as any).id // Use the id field as MongoDB _id
            }));

            // Insert documents
            await collection.insertMany(documents);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `MongoDB formatting failed: ${error.message}`,
                    DataFormat.MONGODB,
                    'MONGO_ERROR',
                    error
                );
            }
            throw new DataError(
                'MongoDB formatting failed: Unknown error',
                DataFormat.MONGODB,
                'MONGO_ERROR'
            );
        } finally {
            if (this.client) {
                await this.client.close();
                this.client = null;
            }
        }
    }

    async parse(data: unknown, config: FormatConfig): Promise<T[]> {
        try {
            const client = await this.getConnection();
            const mongoConfig = config.options?.connection as MongoConnection;
            
            await client.connect();
            const db = client.db(mongoConfig.database);
            const collection = db.collection(mongoConfig.collection);

            // Query all documents
            const documents = await collection.find({}).toArray();
            
            // Convert MongoDB documents to our data type
            return documents.map(doc => {
                const { _id, ...rest } = doc;
                return {
                    ...rest,
                    id: _id.toString()
                } as T;
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `MongoDB parsing failed: ${error.message}`,
                    DataFormat.MONGODB,
                    'MONGO_ERROR',
                    error
                );
            }
            throw new DataError(
                'MongoDB parsing failed: Unknown error',
                DataFormat.MONGODB,
                'MONGO_ERROR'
            );
        } finally {
            if (this.client) {
                await this.client.close();
                this.client = null;
            }
        }
    }
}

export function createMongoFormatter<T>(config?: FormatConfig): MongoFormatter<T> {
    return new MongoFormatter<T>(config || { type: DataFormat.MONGODB });
} 