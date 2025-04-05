/// <reference types="jest" />

import { createApiReader } from '../api.reader';
import { DataError, DataSource, SourceConfig, ApiReaderConfig } from '../../types';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiReader', () => {
    const mockConfig: ApiReaderConfig = {
        url: 'https://api.example.com/users',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
        }
    };

    const mockSourceConfig: SourceConfig = {
        type: DataSource.API,
        location: 'users'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('read method', () => {
        test('should successfully fetch and parse JSON data', async () => {
            const mockData = [
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
            ];
            
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = createApiReader(mockConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                mockConfig.url,
                {
                    method: 'GET',
                    headers: mockConfig.headers,
                    body: undefined
                }
            );
        });

        test('should handle POST request with body', async () => {
            const postConfig: ApiReaderConfig = {
                ...mockConfig,
                method: 'POST',
                body: { filter: 'active' }
            };
            
            const mockData = [{ id: 1, name: 'Active User' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = createApiReader(postConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                postConfig.url,
                {
                    method: 'POST',
                    headers: postConfig.headers,
                    body: JSON.stringify({ filter: 'active' })
                }
            );
        });

        test('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            const reader = createApiReader(mockConfig);
            
            await expect(reader.read(mockSourceConfig)).rejects.toMatchObject({
                message: 'API request failed: Unauthorized',
                source: DataSource.API,
                code: 'API_ERROR',
                details: {
                    status: 401,
                    statusText: 'Unauthorized'
                }
            });
        });

        test('should handle network errors', async () => {
            const networkError = new Error('Failed to connect');
            mockFetch.mockRejectedValueOnce(networkError);

            const reader = createApiReader(mockConfig);
            
            await expect(reader.read(mockSourceConfig)).rejects.toMatchObject({
                message: 'API request failed: Failed to connect',
                source: DataSource.API,
                code: 'API_ERROR',
                details: networkError
            });
        });

        test('should handle unknown error types', async () => {
            mockFetch.mockRejectedValueOnce('string error');

            const reader = createApiReader(mockConfig);
            
            await expect(reader.read(mockSourceConfig)).rejects.toMatchObject({
                message: 'API request failed: Unknown error',
                source: DataSource.API,
                code: 'API_ERROR'
            });
        });

        test('should use default GET method when not specified', async () => {
            const configWithoutMethod: ApiReaderConfig = {
                url: mockConfig.url,
                headers: mockConfig.headers
            };
            
            const mockData = [{ id: 1, name: 'Default Method Test' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = createApiReader(configWithoutMethod);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                configWithoutMethod.url,
                {
                    method: 'GET',
                    headers: configWithoutMethod.headers,
                    body: undefined
                }
            );
        });

        test('should handle undefined body in config', async () => {
            const configWithUndefinedBody: ApiReaderConfig = {
                ...mockConfig,
                body: undefined
            };
            
            const mockData = [{ id: 1, name: 'Undefined Body Test' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = createApiReader(configWithUndefinedBody);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                configWithUndefinedBody.url,
                {
                    method: 'GET',
                    headers: configWithUndefinedBody.headers,
                    body: undefined
                }
            );
        });

        test('should use empty object for headers when not provided', async () => {
            const configWithoutHeaders: ApiReaderConfig = {
                url: mockConfig.url
            };
            
            const mockData = [{ id: 1, name: 'No Headers Test' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = createApiReader(configWithoutHeaders);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                configWithoutHeaders.url,
                {
                    method: 'GET',
                    headers: {},
                    body: undefined
                }
            );
        });
    });

    describe('createApiReader factory', () => {
        test('should create a new ApiReader instance', () => {
            const reader = createApiReader(mockConfig);
            expect(reader).toBeDefined();
            expect(reader).toHaveProperty('read');
        });
    });
}); 