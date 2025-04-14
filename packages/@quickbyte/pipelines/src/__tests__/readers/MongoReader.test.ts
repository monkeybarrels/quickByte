import { MongoReader } from '../../readers/MongoReader';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

describe('MongoReader', () => {
  let mongoReader: MongoReader;
  const mockData = [{ id: 1, name: 'Test' }];
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(mockData)
  };
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection)
  };
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mockDb)
  };

  beforeEach(() => {
    (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    mongoReader = new MongoReader({
      location: 'mongodb://localhost:27017/testdb',
      collection: 'testCollection',
      query: { active: true }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      mongoReader = new MongoReader({});
      expect(mongoReader).toBeDefined();
    });

    it('should initialize with custom values', () => {
      const config = {
        location: 'mongodb://localhost:27017/mydb',
        collection: 'users',
        query: { status: 'active' }
      };
      mongoReader = new MongoReader(config);
      expect(mongoReader).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to MongoDB successfully', async () => {
      await mongoReader.connect();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should throw error when connection string is not provided', async () => {
      mongoReader = new MongoReader({});
      await expect(mongoReader.connect()).rejects.toThrow('MongoDB connection string is required');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB successfully', async () => {
      await mongoReader.connect();
      await mongoReader.disconnect();
      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should not throw error when client is not connected', async () => {
      await mongoReader.disconnect();
      expect(mockClient.close).not.toHaveBeenCalled();
    });
  });

  describe('read', () => {
    it('should throw error when client is not connected', async () => {
      await expect(mongoReader.read()).rejects.toThrow('MongoDB client not connected');
    });

    it('should read data from MongoDB successfully', async () => {
      await mongoReader.connect();
      const result = await mongoReader.read();
      
      expect(mockClient.db).toHaveBeenCalledWith('testdb');
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.find).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockData);
    });

    it('should handle MongoDB errors', async () => {
      const error = new Error('MongoDB Error');
      mockCollection.toArray.mockRejectedValue(error);

      await mongoReader.connect();
      await expect(mongoReader.read()).rejects.toThrow('MongoDB Error');
    });
  });
}); 