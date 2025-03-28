import { promises as fs } from 'fs';
import { DataWriter, WriterConfig } from './base.writer';
import { DataError, DataSource } from '../types';

export interface CsvWriterConfig extends WriterConfig {
    options: {
        path: string;
        encoding?: BufferEncoding;
        append?: boolean;
        delimiter?: string;
    };
}

export class CsvWriter<T> implements DataWriter<T> {
    constructor(private config: CsvWriterConfig) {}

    async write(data: T[], config: WriterConfig): Promise<void> {
        try {
            const fileConfig = config.options as CsvWriterConfig['options'];
            const delimiter = fileConfig.delimiter || ',';
            
            // Convert data to CSV format
            const headers = Object.keys(data[0] as Record<string, unknown>);
            const csvRows = [
                headers.join(delimiter),
                ...data.map(row => 
                    headers.map(header => 
                        (row as Record<string, unknown>)[header]
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
            let headers: string[] = [];

            for await (const chunk of data) {
                if (isFirstChunk) {
                    headers = Object.keys(chunk as Record<string, unknown>);
                    await this.writeToFile(headers.join(delimiter) + '\n', fileConfig);
                    isFirstChunk = false;
                }

                const row = headers.map(header => 
                    (chunk as Record<string, unknown>)[header]
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