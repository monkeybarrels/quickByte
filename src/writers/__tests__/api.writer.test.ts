/// <reference types="jest" />

import { createApiWriter } from '../api.writer';
import { DataError, DataSource } from '../../types';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiWriter', () => {
    const mockConfig = {
        type: DataSource.API,
        options: {
            url: 'https://api.example.com/data',
            method: 'POST' as const,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    };

    const testData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('write', () => {
        it('should successfully write data to API', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true });

            const writer = createApiWriter(mockConfig);
            await writer.write(testData, mockConfig);

            expect(mockFetch).toHaveBeenCalledWith(
                mockConfig.options.url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                }
            );
        });

        it('should use custom method when specified', async () => {
            const putConfig = {
                ...mockConfig,
                options: { ...mockConfig.options, method: 'PUT' as const }
            };
            mockFetch.mockResolvedValueOnce({ ok: true });

            const writer = createApiWriter(putConfig);
            await writer.write(testData, putConfig);

            expect(mockFetch).toHaveBeenCalledWith(
                putConfig.options.url,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                }
            );
        });

        it('should merge custom headers with defaults', async () => {
            const customConfig = {
                ...mockConfig,
                options: {
                    ...mockConfig.options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer token'
                    }
                }
            };
            mockFetch.mockResolvedValueOnce({ ok: true });

            const writer = createApiWriter(customConfig);
            await writer.write(testData, customConfig);

            expect(mockFetch).toHaveBeenCalledWith(
                customConfig.options.url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer token'
                    },
                    body: JSON.stringify(testData)
                }
            );
        });

        it('should throw DataError when API request fails', async () => {
            mockFetch.mockResolvedValueOnce({ 
                ok: false, 
                status: 500,
                statusText: 'Internal Server Error'
            });

            const writer = createApiWriter(mockConfig);
            await expect(writer.write(testData, mockConfig)).rejects.toMatchObject({
                source: DataSource.API,
                code: 'API_ERROR',
                message: expect.stringContaining('HTTP error! status: 500')
            });
        });

        it('should throw DataError when network error occurs', async () => {
            const networkError = new Error('Network error');
            mockFetch.mockRejectedValueOnce(networkError);

            const writer = createApiWriter(mockConfig);
            await expect(writer.write(testData, mockConfig)).rejects.toMatchObject({
                source: DataSource.API,
                code: 'API_ERROR',
                message: expect.stringContaining('Network error')
            });
        });
    });

    describe('writeStream', () => {
        it('should write stream data in batches', async () => {
            mockFetch.mockResolvedValue({ ok: true });

            const batchConfig = {
                ...mockConfig,
                options: { ...mockConfig.options, batchSize: 2 }
            };
            const writer = createApiWriter(batchConfig);

            const asyncData = async function* () {
                yield testData[0];
                yield testData[1];
                yield { id: 3, name: 'Test3' };
            };

            await writer.writeStream(asyncData(), batchConfig);

            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(mockFetch).toHaveBeenNthCalledWith(
                1,
                mockConfig.options.url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([testData[0], testData[1]])
                }
            );
            expect(mockFetch).toHaveBeenNthCalledWith(
                2,
                mockConfig.options.url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([{ id: 3, name: 'Test3' }])
                }
            );
        });

        it('should throw DataError when batch write fails', async () => {
            mockFetch.mockResolvedValueOnce({ ok: true })
                    .mockResolvedValueOnce({ 
                        ok: false, 
                        status: 500,
                        statusText: 'Internal Server Error'
                    });

            const batchConfig = {
                ...mockConfig,
                options: { ...mockConfig.options, batchSize: 1 }
            };
            const writer = createApiWriter(batchConfig);

            const asyncData = async function* () {
                yield testData[0];
                yield testData[1];
            };

            await expect(writer.writeStream(asyncData(), batchConfig)).rejects.toMatchObject({
                source: DataSource.API,
                code: 'API_ERROR',
                message: expect.stringContaining('HTTP error! status: 500')
            });
        });
    });
}); 