import { DataReader, DatabaseReaderConfig, SourceConfig, DataError } from '../types';
import { Pool } from 'pg';

export class DatabaseReader<T> implements DataReader<T> {
    private config: DatabaseReaderConfig;
    private pool: Pool;

    constructor(config: DatabaseReaderConfig) {
        this.config = config;
        this.pool = new Pool({
            host: config.connection.host,
            port: config.connection.port,
            database: config.connection.database,
            user: config.connection.username,
            password: config.connection.password,
            ssl: config.connection.ssl ? { rejectUnauthorized: false } : false
        });
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const query = this.config.query || `SELECT * FROM ${this.config.table}`;
            const result = await this.pool.query(query);
            return result.rows as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Database query failed: ${error.message}`,
                    'database',
                    'DB_ERROR',
                    error
                );
            }
            throw new DataError(
                'Database query failed: Unknown error',
                'database',
                'DB_ERROR'
            );
        }
    }

    async readStream(config: SourceConfig, params?: unknown): Promise<AsyncIterable<T>> {
        const client = await this.pool.connect();
        const query = this.config.query || `SELECT * FROM ${this.config.table}`;
        const result = await client.query(query);

        return {
            async *[Symbol.asyncIterator]() {
                try {
                    for (const row of result.rows) {
                        yield row as T;
                    }
                } finally {
                    client.release();
                }
            }
        };
    }
}

export function createDatabaseReader<T>(config: DatabaseReaderConfig): DatabaseReader<T> {
    return new DatabaseReader<T>(config);
} 