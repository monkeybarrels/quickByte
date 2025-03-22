import { DataFormatter, DatabaseFormatterConfig, FormatConfig, DataError } from '../types';
import { Pool } from 'pg';

/**
 * A formatter class that handles data formatting and parsing for PostgreSQL database operations.
 * This class implements the DataFormatter interface to provide database-specific data handling.
 * 
 * @template T - The type of data being formatted/parsed
 */
export class DatabaseFormatter<T> implements DataFormatter<T, void> {
    private config: DatabaseFormatterConfig;
    private pool: Pool;

    /**
     * Creates a new DatabaseFormatter instance.
     * 
     * @param {DatabaseFormatterConfig} config - Configuration object containing database connection details
     * @throws {Error} If the database connection configuration is invalid
     */
    constructor(config: DatabaseFormatterConfig) {
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
     * Formats and inserts data into the configured database table.
     * This method will first truncate the existing table and then insert all new records.
     * 
     * @param {T[]} data - Array of data items to be inserted into the database
     * @param {FormatConfig} config - Configuration options for the formatting process
     * @returns {Promise<void>} A promise that resolves when the formatting is complete
     * @throws {DataError} If the database operation fails
     */
    async format(data: T[], config: FormatConfig): Promise<void> {
        try {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');

                // Clear existing data
                await client.query(`TRUNCATE TABLE ${this.config.table}`);

                // Insert new data
                for (const item of data) {
                    const columns = Object.keys(item as Record<string, unknown>);
                    const values = Object.values(item as Record<string, unknown>);
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    
                    await client.query(
                        `INSERT INTO ${this.config.table} (${columns.join(', ')}) VALUES (${placeholders})`,
                        values
                    );
                }

                await client.query('COMMIT');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Database formatting failed: ${error.message}`,
                    'database',
                    'FORMAT_ERROR',
                    error
                );
            }
            throw new DataError(
                'Database formatting failed: Unknown error',
                'database',
                'FORMAT_ERROR'
            );
        }
    }

    /**
     * Parses data from the configured database table.
     * 
     * @param {void} data - This parameter is unused as data is fetched directly from the database
     * @param {FormatConfig} config - Configuration options for the parsing process
     * @returns {Promise<T[]>} A promise that resolves with an array of parsed data items
     * @throws {DataError} If the database query fails
     */
    async parse(data: void, config: FormatConfig): Promise<T[]> {
        try {
            const result = await this.pool.query(`SELECT * FROM ${this.config.table}`);
            return result.rows as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `Database parsing failed: ${error.message}`,
                    'database',
                    'PARSE_ERROR',
                    error
                );
            }
            throw new DataError(
                'Database parsing failed: Unknown error',
                'database',
                'PARSE_ERROR'
            );
        }
    }
}

/**
 * Factory function to create a new DatabaseFormatter instance.
 * 
 * @template T - The type of data being formatted/parsed
 * @param {DatabaseFormatterConfig} config - Configuration object containing database connection details
 * @returns {DatabaseFormatter<T>} A new DatabaseFormatter instance
 */
export function createDatabaseFormatter<T>(config: DatabaseFormatterConfig): DatabaseFormatter<T> {
    return new DatabaseFormatter<T>(config);
} 