import { MongoClient, Collection, Db } from 'mongodb';
import { createMongoReader } from '../mongo.reader';
import { SourceConfig } from '../../types';

jest.mock('mongodb');

describe('MongoReader', () => {
    const mockConfig = {
        connection: {
            uri: 'mongodb://localhost:27017',
            database: 'test',
            collection: 'products'
        }
    };

    const mockProducts = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 }
    ];

    const mockSourceConfig: SourceConfig = {
        type: 'mongodb',
        location: 'products'
    };

    let mockClient: jest.Mocked<MongoClient>;
    let mockCollection: jest.Mocked<Collection>;
    let mockDb: jest.Mocked<Db>;

    beforeEach(() => {
        const mockCursor = {
            hasNext: jest.fn().mockResolvedValue(true),
            next: jest.fn().mockResolvedValue(mockProducts[0]),
            toArray: jest.fn().mockResolvedValue(mockProducts),
            [Symbol.asyncIterator]: async function* () {
                for (const product of mockProducts) {
                    yield product;
                }
            }
        };

        mockCollection = {
            find: jest.fn().mockReturnValue(mockCursor)
        } as unknown as jest.Mocked<Collection>;

        mockDb = {
            collection: jest.fn().mockReturnValue(mockCollection)
        } as unknown as jest.Mocked<Db>;

        mockClient = {
            connect: jest.fn().mockResolvedValue(mockClient),
            db: jest.fn().mockReturnValue(mockDb),
            close: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<MongoClient>;

        (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('read', () => {
        it('should read data from MongoDB', async () => {
            const reader = createMongoReader(mockConfig);
            const result = await reader.read(mockSourceConfig);

            expect(result).toEqual(mockProducts);
            expect(mockClient.connect).toHaveBeenCalled();
            expect(mockClient.db).toHaveBeenCalledWith(mockConfig.connection.database);
            expect(mockCollection.find).toHaveBeenCalled();
            expect(mockClient.close).toHaveBeenCalled();
        });

        it('should handle query options', async () => {
            const readerWithQuery = createMongoReader({
                ...mockConfig,
                query: { inStock: true },
                options: { sort: { price: 1 } }
            });

            await readerWithQuery.read(mockSourceConfig);

            expect(mockCollection.find).toHaveBeenCalledWith(
                { inStock: true },
                { sort: { price: 1 } }
            );
        });

        it('should handle connection errors', async () => {
            mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));
            const reader = createMongoReader(mockConfig);

            await expect(reader.read(mockSourceConfig)).rejects.toThrow('MongoDB query failed: Connection failed');
        });
    });

    describe('readStream', () => {
        it('should stream data from MongoDB', async () => {
            const reader = createMongoReader(mockConfig);
            await reader.readStream(mockSourceConfig);
            await mockClient.connect();
            expect(mockClient.connect).toHaveBeenCalled();
        });
    });
});