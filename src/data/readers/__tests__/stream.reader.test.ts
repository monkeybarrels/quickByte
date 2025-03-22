import { Readable } from 'stream';
import { StreamReader, createStreamReader } from '../stream.reader';
import { DataError, SourceConfig } from '../../types';

describe('StreamReader', () => {
    const mockSourceConfig: SourceConfig = {
        type: 'stream',
        location: 'test-stream',
    };

    describe('read method', () => {
        it('should read and parse JSON lines from stream', async () => {
            const testData = [
                JSON.stringify({ id: 1, name: 'test1' }),
                JSON.stringify({ id: 2, name: 'test2' })
            ].join('\n');
            
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number; name: string }>({ stream });
            
            const result = await reader.read(mockSourceConfig);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ id: 1, name: 'test1' });
            expect(result[1]).toEqual({ id: 2, name: 'test2' });
        });

        it('should handle empty lines', async () => {
            const testData = [
                JSON.stringify({ id: 1 }),
                '',
                JSON.stringify({ id: 2 })
            ].join('\n');
            
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number }>({ stream });
            
            const result = await reader.read(mockSourceConfig);
            expect(result).toHaveLength(2);
        });

        it('should handle different encodings', async () => {
            const testData = JSON.stringify({ id: 1, name: 'test' });
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number; name: string }>({ stream, encoding: 'utf8' });
            
            const result = await reader.read(mockSourceConfig);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ id: 1, name: 'test' });
        });

        it('should throw DataError on invalid JSON', async () => {
            const testData = 'invalid json';
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number }>({ stream });
            
            await expect(reader.read(mockSourceConfig)).rejects.toThrow(DataError);
        });
    });

    describe('readStream method', () => {
        it('should stream JSON lines', async () => {
            const testData = [
                JSON.stringify({ id: 1 }),
                JSON.stringify({ id: 2 })
            ].join('\n');
            
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number }>({ stream });
            
            const results: { id: number }[] = [];
            for await (const item of await reader.readStream(mockSourceConfig)) {
                results.push(item);
            }
            
            expect(results).toHaveLength(2);
            expect(results[0]).toEqual({ id: 1 });
            expect(results[1]).toEqual({ id: 2 });
        });

        it('should handle chunked data', async () => {
            const chunk1 = JSON.stringify({ id: 1 }) + '\n';
            const chunk2 = JSON.stringify({ id: 2 });
            
            const stream = Readable.from([Buffer.from(chunk1, 'utf8'), Buffer.from(chunk2, 'utf8')]);
            const reader = createStreamReader<{ id: number }>({ stream });
            
            const results: { id: number }[] = [];
            for await (const item of await reader.readStream(mockSourceConfig)) {
                results.push(item);
            }
            
            expect(results).toHaveLength(2);
        });

        it('should skip empty lines while streaming', async () => {
            const testData = [
                JSON.stringify({ id: 1 }),
                '',
                JSON.stringify({ id: 2 })
            ].join('\n');
            
            const stream = Readable.from(Buffer.from(testData, 'utf8'));
            const reader = createStreamReader<{ id: number }>({ stream });
            
            const results: { id: number }[] = [];
            for await (const item of await reader.readStream(mockSourceConfig)) {
                results.push(item);
            }
            
            expect(results).toHaveLength(2);
        });
    });

    describe('factory function', () => {
        it('should create a StreamReader instance', () => {
            const stream = Readable.from(Buffer.from('', 'utf8'));
            const reader = createStreamReader<{ id: number }>({ stream });
            expect(reader).toBeInstanceOf(StreamReader);
        });
    });
}); 