import { DataWriter, SourceConfig, DataError, DataSource } from '../types';
import { promises as fs } from 'fs';

export class JsonWriter<T> implements DataWriter<T> {
    async write(data: T[], config: SourceConfig): Promise<void> {
        try {
            const content = JSON.stringify(data, null, 2);
            await fs.writeFile(config.location, content, 'utf-8');
        } catch (error) {
            if (error instanceof DataError) {
                throw error;
            }
            throw new DataError(
                `Failed to write JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                DataSource.FILE,
                'JSON_WRITE_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }
} 