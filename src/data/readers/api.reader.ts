import { DataReader, ApiReaderConfig, SourceConfig, DataError } from '../types';

/**
 * A data reader implementation that fetches data from an HTTP API endpoint.
 * This class handles making HTTP requests and processing the responses.
 * 
 * @template T - The type of data that will be returned from the API
 */
export class ApiReader<T> implements DataReader<T> {
    private config: ApiReaderConfig;

    /**
     * Creates a new instance of ApiReader.
     * 
     * @param config - Configuration object containing API endpoint details
     * @param config.url - The URL of the API endpoint
     * @param config.method - HTTP method to use (defaults to 'GET')
     * @param config.headers - Optional HTTP headers to include in the request
     * @param config.body - Optional request body to send with the request
     */
    constructor(config: ApiReaderConfig) {
        this.config = config;
    }

    /**
     * Reads data from the configured API endpoint.
     * 
     * @param config - Source configuration (not used in API reader)
     * @param params - Optional parameters to include in the request
     * @returns Promise resolving to an array of data of type T
     * @throws {DataError} When the API request fails or returns an error
     */
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

/**
 * Factory function to create a new ApiReader instance.
 * 
 * @template T - The type of data that will be returned from the API
 * @param config - Configuration object containing API endpoint details
 * @returns A new ApiReader instance
 */
export function createApiReader<T>(config: ApiReaderConfig): ApiReader<T> {
    return new ApiReader<T>(config);
} 