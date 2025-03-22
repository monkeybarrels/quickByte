import { ApiReader, createApiReader } from '../api.reader';
import { ApiReaderConfig, DataError, SourceConfig } from '../../types';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiReader', () => {
    let config: ApiReaderConfig;
    let sourceConfig: SourceConfig;
    
    beforeEach(() => {
        config = {
            url: 'https://api.example.com/data',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        sourceConfig = {
            type: 'api',
            location: 'test-endpoint'
        };
        mockFetch.mockClear();
    });

    describe('read', () => {
        it('should successfully fetch and return data', async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const reader = new ApiReader(config);
            const result = await reader.read(sourceConfig);

            expect(result).toEqual(mockData);
            expect(mockFetch).toHaveBeenCalledWith(
                config.url,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    body: undefined
                }
            );
        });

        it('should use POST method and body when configured', async () => {
            const postConfig: ApiReaderConfig = {
                ...config,
                method: 'POST',
                body: { test: true }
            };
            
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => []
            });

            const reader = new ApiReader(postConfig);
            await reader.read(sourceConfig);

            expect(mockFetch).toHaveBeenCalledWith(
                config.url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true })
                }
            );
        });

        it('should throw DataError when response is not ok', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            const reader = new ApiReader(config);
            
            await expect(reader.read(sourceConfig)).rejects.toMatchObject({
                message: 'API request failed: Not Found',
                source: 'api',
                code: 'API_ERROR',
                details: {
                    status: 404,
                    statusText: 'Not Found'
                }
            });
        });

        it('should throw DataError when fetch fails', async () => {
            const networkError = new Error('Network error');
            mockFetch.mockRejectedValueOnce(networkError);

            const reader = new ApiReader(config);
            
            await expect(reader.read(sourceConfig)).rejects.toMatchObject({
                message: 'API request failed: Network error',
                source: 'api',
                code: 'API_ERROR',
                details: networkError
            });
        });
    });

    describe('createApiReader', () => {
        it('should create an instance of ApiReader', () => {
            const reader = createApiReader(config);
            expect(reader).toBeInstanceOf(ApiReader);
        });
    });
}); 