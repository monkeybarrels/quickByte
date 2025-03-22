import { DataReader, ApiReaderConfig, SourceConfig, DataError } from '../types';

export class ApiReader<T> implements DataReader<T> {
    private config: ApiReaderConfig;

    constructor(config: ApiReaderConfig) {
        this.config = config;
    }

    async read(config: SourceConfig, params?: unknown): Promise<T[]> {
        try {
            const response = await fetch(this.config.url, {
                method: this.config.method || 'GET',
                headers: this.config.headers || {},
                body: this.config.body ? JSON.stringify(this.config.body) : undefined
            });

            if (!response.ok) {
                throw new DataError(
                    `API request failed: ${response.statusText}`,
                    'api',
                    'API_ERROR',
                    { status: response.status, statusText: response.statusText }
                );
            }

            return await response.json() as T[];
        } catch (error: unknown) {
            if (error instanceof DataError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new DataError(
                    `API request failed: ${error.message}`,
                    'api',
                    'API_ERROR',
                    error
                );
            }
            throw new DataError(
                'API request failed: Unknown error',
                'api',
                'API_ERROR'
            );
        }
    }
}

export function createApiReader<T>(config: ApiReaderConfig): ApiReader<T> {
    return new ApiReader<T>(config);
} 