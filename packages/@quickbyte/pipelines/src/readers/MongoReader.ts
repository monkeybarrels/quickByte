import { Reader } from '../types';
import { MongoClient } from 'mongodb';

/**
 * A reader implementation that reads data from a MongoDB database.
 * This class handles connection management and data retrieval from MongoDB collections.
 */
export class MongoReader implements Reader {
  /** MongoDB client instance */
  private client: MongoClient | null = null;
  /** MongoDB connection URL */
  private url: string;
  /** Name of the database to connect to */
  private dbName: string;
  /** Name of the collection to read from */
  private collectionName: string;
  /** Query filter to apply when reading documents */
  private query: Record<string, any>;

  /**
   * Creates a new MongoReader instance
   * @param config - Configuration object containing MongoDB connection details
   * @param config.location - MongoDB connection string
   * @param config.collection - Name of the collection to read from
   * @param config.query - Optional query filter to apply when reading documents
   */
  constructor(config: any) {
    this.url = config.location || '';
    this.dbName = config.location?.split('/').pop()?.split('?')[0] || 'default';
    this.collectionName = config.collection || 'default';
    this.query = config.query || {};
  }

  /**
   * Establishes a connection to the MongoDB database
   * @throws {Error} If the connection string is not provided
   */
  async connect(): Promise<void> {
    if (!this.url) {
      throw new Error('MongoDB connection string is required');
    }
    
    this.client = new MongoClient(this.url);
    await this.client.connect();
  }

  /**
   * Closes the connection to the MongoDB database
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Reads documents from the configured MongoDB collection
   * @returns Promise that resolves to an array of documents matching the query
   * @throws {Error} If the MongoDB client is not connected
   */
  async read(): Promise<any[]> {
    if (!this.client) {
      throw new Error('MongoDB client not connected');
    }

    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);
    
    return collection.find(this.query).toArray();
  }
} 