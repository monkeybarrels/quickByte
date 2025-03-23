import { DataReader, FileReaderConfig, SourceConfig, DataError, DataSource, DataFormat } from '../types';

export class CsvReader<T> implements DataReader<T> {
    private config: FileReaderConfig;

    constructor(config: FileReaderConfig) {
        this.config = config;
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const content = config.options?.content as string;
            if (!content) {
                throw new Error('No content provided in source config');
            }

            const lines = content.split('\n');
            const headers = lines[0].split(this.config.delimiter || ',');
            const data: T[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(this.config.delimiter || ',');
                const row: Record<string, string> = {};

                headers.forEach((header, index) => {
                    row[header.trim()] = values[index]?.trim() || '';
                });

                data.push(row as T);
            }

            return data;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV reading failed: ${error.message}`,
                    DataSource.FILE,
                    'CSV_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV reading failed: Unknown error',
                DataSource.FILE,
                'CSV_ERROR'
            );
        }
    }
}

export function createCsvReader<T>(config?: FileReaderConfig): CsvReader<T> {
    return new CsvReader<T>(config || { path: '', format: DataFormat.CSV });
} 