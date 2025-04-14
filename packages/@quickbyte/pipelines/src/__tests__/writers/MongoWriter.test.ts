import { MongoWriter } from '../../writers/mongo-writer';
import { MongoClient, Collection, Db } from 'mongodb';

jest.mock('mongodb');

describe('MongoWriter', () => {
  let writer: MongoWriter;
  let mockClient: jest.Mocked<MongoClient>;
  let mockCollection: jest.Mocked<Collection>;
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  const testConfig = {
    location: 'mongodb://localhost:27017',
    options: {
      database: 'test',
      collection: 'users'
    }
  };

  beforeEach(async () => {
    mockCollection = {
      insertMany: jest.fn().mockResolvedValue({ insertedCount: 2 }),
      drop: jest.fn().mockResolvedValue(undefined)
    } as any;

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    } as any;

    mockClient = {
      connect: jest.fn().mockResolvedValue(mockClient),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb)
    } as any;

    (MongoClient as jest.MockedClass<typeof MongoClient>).mockImplementation(() => mockClient);
    writer = new MongoWriter(testConfig);
  });

  afterEach(async () => {
    await writer.disconnect();
    jest.clearAllMocks();
  });

  describe('write', () => {
    it('should insert data into MongoDB', async () => {
      await writer.write(testData);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalledWith(testConfig.options.database);
      expect(mockClient.db().collection).toHaveBeenCalledWith(testConfig.options.collection);
      expect(mockCollection.drop).toHaveBeenCalled();
      expect(mockCollection.insertMany).toHaveBeenCalledWith(testData);
    });

    it('should handle empty data', async () => {
      await writer.write([]);

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockCollection.drop).toHaveBeenCalled();
      expect(mockCollection.insertMany).toHaveBeenCalledWith([]);
    });

    it('should handle connection errors', async () => {
      mockClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(writer.write(testData)).rejects.toThrow('Connection failed');
    });

    it('should handle insertion errors', async () => {
      mockCollection.insertMany.mockRejectedValueOnce(new Error('Insertion failed'));

      await expect(writer.write(testData)).rejects.toThrow('Insertion failed');
    });
  });
}); 