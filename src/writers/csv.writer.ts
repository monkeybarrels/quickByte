import { promises as fs } from 'fs';
import { DataWriter, WriterConfig } from './base.writer';
import { DataError, DataSource } from '../types';

export interface CsvWriterConfig extends WriterConfig {
    options: {
        path: string;
        encoding?: BufferEncoding;
        append?: boolean;
        delimiter?: string;
        columns?: string[]; // Optional array to specify column order
    };
}

export class CsvWriter<T> implements DataWriter<T> {
    constructor(private config: CsvWriterConfig) {}

    async write(data: T[], config: WriterConfig): Promise<void> {
        try {
            const fileConfig = config.options as CsvWriterConfig['options'];
            const delimiter = fileConfig.delimiter || ',';
            
            // Use provided columns or fall back to object keys
            const columns = fileConfig.columns || Object.keys(data[0] as Record<string, unknown>);
            
            // Convert data to CSV format
            const csvRows = [
                columns.join(delimiter),
                ...data.map(row => 
                    columns.map(column => 
                        (row as Record<string, unknown>)[column]
                    ).join(delimiter)
                )
            ];

            // Write to file
            await this.writeToFile(csvRows.join('\n'), fileConfig);
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV writing failed: ${error.message}`,
                    DataSource.FILE,
                    'CSV_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV writing failed: Unknown error',
                DataSource.FILE,
                'CSV_ERROR'
            );
        }
    }

    async writeStream(data: AsyncIterable<T>, config: WriterConfig): Promise<void> {
        try {
            const fileConfig = config.options as CsvWriterConfig['options'];
            const delimiter = fileConfig.delimiter || ',';
            let isFirstChunk = true;
            let columns: string[] = [];

            for await (const chunk of data) {
                if (isFirstChunk) {
                    // Use provided columns or fall back to object keys
                    columns = fileConfig.columns || Object.keys(chunk as Record<string, unknown>);
                    await this.writeToFile(columns.join(delimiter) + '\n', fileConfig);
                    isFirstChunk = false;
                }

                const row = columns.map(column => 
                    (chunk as Record<string, unknown>)[column]
                ).join(delimiter);

                await this.writeToFile(row + '\n', fileConfig);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV stream writing failed: ${error.message}`,
                    DataSource.FILE,
                    'CSV_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV stream writing failed: Unknown error',
                DataSource.FILE,
                'CSV_ERROR'
            );
        }
    }

    private async writeToFile(content: string, config: CsvWriterConfig['options']): Promise<void> {
        const flags = config.append ? 'a' : 'w';
        await fs.writeFile(config.path, content, {
            encoding: config.encoding || 'utf-8',
            flag: flags
        });
    }
}

export function createCsvWriter<T>(config: CsvWriterConfig): CsvWriter<T> {
    return new CsvWriter<T>(config);
} 