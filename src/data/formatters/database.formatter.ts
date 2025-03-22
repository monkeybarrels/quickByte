import { DataFormatter, DatabaseFormatterConfig, FormatConfig, DataError } from '../types';
import { Pool } from 'pg';

export class DatabaseFormatter<T> implements DataFormatter<T, void> {
    private config: DatabaseFormatterConfig;
    private pool: Pool;

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

export function createDatabaseFormatter<T>(config: DatabaseFormatterConfig): DatabaseFormatter<T> {
    return new DatabaseFormatter<T>(config);
} 