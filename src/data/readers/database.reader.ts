import { DataReader, DatabaseReaderConfig, SourceConfig, DataError } from '../types';
import { Pool } from 'pg';

/**
 * A data reader implementation that reads data from a PostgreSQL database.
 * This class handles database connections and query execution, providing both
 * synchronous and streaming data access methods.
 * 
 * @template T - The type of data being read from the database
 */
export class DatabaseReader<T> implements DataReader<T> {
    private config: DatabaseReaderConfig;
    private pool: Pool;

    /**
     * Creates a new DatabaseReader instance.
     * 
     * @param config - Configuration object containing database connection details
     * and query information
     */
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

    /**
     * Reads data from the database synchronously.
     * 
     * @param config - Source configuration for the read operation
     * @param params - Optional parameters for the query
     * @returns Promise resolving to an array of data items
     * @throws {DataError} If the database query fails
     */
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

    /**
     * Reads data from the database as a stream.
     * 
     * @param config - Source configuration for the read operation
     * @param params - Optional parameters for the query
     * @returns Promise resolving to an AsyncIterable of data items
     */
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

/**
 * Factory function to create a new DatabaseReader instance.
 * 
 * @template T - The type of data being read from the database
 * @param config - Configuration object containing database connection details
 * and query information
 * @returns A new DatabaseReader instance
 */
export function createDatabaseReader<T>(config: DatabaseReaderConfig): DatabaseReader<T> {
    return new DatabaseReader<T>(config);
} 