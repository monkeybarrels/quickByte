/// <reference types="jest" />

import { DataWriter, WriterConfig } from '../base.writer';
import { DataError, DataSource, DataFormat } from '../../types';

// Test implementation of BaseWriter
class TestWriter<T> implements DataWriter<T> {
    public writeCallCount = 0;
    public lastWrittenData: T[] = [];

    constructor(private config: WriterConfig) {}

    async write(data: T[], config: WriterConfig): Promise<void> {
        this.writeCallCount++;
        this.lastWrittenData = data;

        if (config.options?.shouldFail) {
            throw new DataError('Write failed', DataSource.FILE, 'WRITE_ERROR');
        }
    }

    async writeStream(stream: AsyncIterable<T>, config: WriterConfig): Promise<void> {
        const batch: T[] = [];
        const batchSize = (config.options?.batchSize as number) || 100;

        for await (const item of stream) {
            batch.push(item);
            if (batch.length >= batchSize) {
                await this.write(batch.slice(), config);
                batch.length = 0;
            }
        }

        if (batch.length > 0) {
            await this.write(batch, config);
        }
    }
}

describe('BaseWriter', () => {
    const mockConfig: WriterConfig = {
        type: DataSource.FILE,
        options: {}
    };

    const testData = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
        { id: 3, name: 'Test3' }
    ];

    let writer: TestWriter<any>;

    beforeEach(() => {
        writer = new TestWriter(mockConfig);
    });

    describe('writeStream', () => {
        it('should process stream data in batches', async () => {
            const batchConfig = {
                ...mockConfig,
                options: { batchSize: 2 }
            };

            const asyncData = async function* () {
                for (const item of testData) {
                    yield item;
                }
            };

            await writer.writeStream(asyncData(), batchConfig);

            expect(writer.writeCallCount).toBe(2); // Two batches: [Test1,Test2] and [Test3]
            expect(writer.lastWrittenData).toEqual([testData[2]]); // Last batch should be [Test3]
        });

        it('should use default batch size when not specified', async () => {
            const asyncData = async function* () {
                for (const item of testData) {
                    yield item;
                }
            };

            await writer.writeStream(asyncData(), mockConfig);

            expect(writer.writeCallCount).toBe(1); // All items in one batch (default size 100)
            expect(writer.lastWrittenData).toEqual(testData);
        });

        it('should handle empty streams', async () => {
            const emptyStream = async function* () {
                // Empty generator
            };

            await writer.writeStream(emptyStream(), mockConfig);
            expect(writer.writeCallCount).toBe(0);
        });

        it('should propagate write errors', async () => {
            const failConfig = {
                ...mockConfig,
                options: { shouldFail: true }
            };

            const asyncData = async function* () {
                yield testData[0];
            };

            await expect(writer.writeStream(asyncData(), failConfig)).rejects.toMatchObject({
                source: DataSource.FILE,
                code: 'WRITE_ERROR',
                message: expect.stringContaining('Write failed')
            });
        });
    });
});
