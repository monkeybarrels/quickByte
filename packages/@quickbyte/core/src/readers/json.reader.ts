import { DataReader, SourceConfig, DataError, DataSource } from '../types';
import fs from 'fs/promises';

export class JsonReader<T> implements DataReader<T> {
    async read(config: SourceConfig): Promise<T[]> {
        try {
            const content = await fs.readFile(config.location, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            if (error instanceof DataError) {
                throw error;
            }
            throw new DataError(
                `Failed to read JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                DataSource.FILE,
                'JSON_READ_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }
} 