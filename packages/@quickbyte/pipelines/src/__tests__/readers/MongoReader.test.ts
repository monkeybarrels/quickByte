import { MongoReader } from '../../readers/MongoReader';
import { MongoClient } from 'mongodb';

jest.mock('mongodb');

describe('MongoReader', () => {
  let mongoReader: MongoReader;
  const mockData = [{ id: 1, name: 'Test' }];
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(mockData),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis()
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
    jest.clearAllMocks();
    (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    mongoReader = new MongoReader({
      location: 'mongodb://localhost:27017/testdb',
      collection: 'testCollection',
      query: { active: true }
    });
  });

  afterEach(async () => {
    // Ensure clean disconnect after each test
    try {
      await mongoReader.disconnect();
    } catch (error) {
      // Ignore disconnect errors in tests
    }
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

    it('should not throw error for invalid connection string during construction', () => {
      expect(() => {
        new MongoReader({ location: 'invalid-connection-string' });
      }).not.toThrow();
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

    it('should throw error when connection fails', async () => {
      const error = new Error('Connection failed');
      mockClient.connect.mockRejectedValueOnce(error);
      await expect(mongoReader.connect()).rejects.toThrow('Connection failed');
    });

    it('should handle connection timeout', async () => {
      mockClient.connect.mockImplementationOnce(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 1000);
      }));
      await expect(mongoReader.connect()).rejects.toThrow('Connection timeout');
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

    it('should propagate disconnect errors', async () => {
      const error = new Error('Disconnect failed');
      mockClient.close.mockRejectedValueOnce(error);
      await mongoReader.connect();
      await expect(mongoReader.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('read', () => {
    beforeEach(async () => {
      await mongoReader.connect();
    });

    it('should throw error when client is not connected', async () => {
      await mongoReader.disconnect();
      await expect(mongoReader.read()).rejects.toThrow('MongoDB client not connected');
    });

    it('should read data from MongoDB successfully', async () => {
      const result = await mongoReader.read();
      
      expect(mockClient.db).toHaveBeenCalledWith('testdb');
      expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
      expect(mockCollection.find).toHaveBeenCalledWith({ active: true });
      expect(result).toEqual(mockData);
    });

    it('should handle MongoDB errors', async () => {
      const error = new Error('MongoDB Error');
      mockCollection.toArray.mockRejectedValueOnce(error);

      await expect(mongoReader.read()).rejects.toThrow('MongoDB Error');
    });

    it('should handle invalid database name', async () => {
      mockClient.db.mockImplementationOnce(() => {
        throw new Error('Invalid database name');
      });

      await expect(mongoReader.read()).rejects.toThrow('Invalid database name');
    });

    it('should handle invalid collection name', async () => {
      mockDb.collection.mockImplementationOnce(() => {
        throw new Error('Invalid collection name');
      });

      await expect(mongoReader.read()).rejects.toThrow('Invalid collection name');
    });

    it('should handle empty result set', async () => {
      mockCollection.toArray.mockResolvedValueOnce([]);
      const result = await mongoReader.read();
      expect(result).toEqual([]);
    });
  });
}); 