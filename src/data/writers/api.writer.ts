import { DataWriter, WriterConfig } from './base.writer';
import { DataError, DataSource } from '../types';

export interface ApiWriterConfig extends WriterConfig {
    options: {
        url: string;
        method?: 'POST' | 'PUT' | 'PATCH';
        headers?: Record<string, string>;
        batchSize?: number;
    };
}

export class ApiWriter<T> implements DataWriter<T> {
    constructor(private config: ApiWriterConfig) {}

    async write(data: T[], config: WriterConfig): Promise<void> {
        try {
            const apiConfig = config.options as ApiWriterConfig['options'];
            const method = apiConfig.method || 'POST';
            const headers = {
                'Content-Type': 'application/json',
                ...apiConfig.headers
            };

            const response = await fetch(apiConfig.url, {
                method,
                headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `API writing failed: ${error.message}`,
                    DataSource.API,
                    'API_ERROR',
                    error
                );
            }
            throw new DataError(
                'API writing failed: Unknown error',
                DataSource.API,
                'API_ERROR'
            );
        }
    }

    async writeStream(data: AsyncIterable<T>, config: WriterConfig): Promise<void> {
        try {
            const apiConfig = config.options as ApiWriterConfig['options'];
            const method = apiConfig.method || 'POST';
            const headers = {
                'Content-Type': 'application/json',
                ...apiConfig.headers
            };
            const batchSize = apiConfig.batchSize || 100;
            let batch: T[] = [];

            for await (const item of data) {
                batch.push(item);
                if (batch.length >= batchSize) {
                    await this.write(batch, config);
                    batch = [];
                }
            }

            if (batch.length > 0) {
                await this.write(batch, config);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `API stream writing failed: ${error.message}`,
                    DataSource.API,
                    'API_ERROR',
                    error
                );
            }
            throw new DataError(
                'API stream writing failed: Unknown error',
                DataSource.API,
                'API_ERROR'
            );
        }
    }
}

export function createApiWriter<T>(config: ApiWriterConfig): ApiWriter<T> {
    return new ApiWriter<T>(config);
} 