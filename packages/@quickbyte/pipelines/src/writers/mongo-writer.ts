import { MongoClient } from 'mongodb';
import { Writer } from '../types';

/**
 * MongoDB Writer implementation that writes data to a MongoDB collection.
 * This writer handles the connection lifecycle and data insertion into a specified MongoDB collection.
 */
export class MongoWriter implements Writer {
  private client: MongoClient;
  private dbName: string;
  private collectionName: string;
  private url: string;

  /**
   * Creates a new instance of MongoWriter.
   * @param config - Configuration object containing MongoDB connection details
   * @param config.location - MongoDB connection URL
   * @param config.options.database - Name of the database to write to
   * @param config.options.collection - Name of the collection to write to
   */
  constructor(config: any) {
    this.url = config.location;
    this.dbName = config.options?.database;
    this.collectionName = config.options?.collection;
    this.client = new MongoClient(this.url);
  }

  /**
   * Establishes a connection to the MongoDB server.
   * @throws {Error} If the connection fails
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Closes the connection to the MongoDB server.
   * @throws {Error} If the disconnection fails
   */
  async disconnect(): Promise<void> {
    await this.client.close();
  }

  /**
   * Writes data to the specified MongoDB collection.
   * This method will:
   * 1. Connect to the MongoDB server
   * 2. Drop the existing collection if it exists
   * 3. Insert the provided data
   * 4. Disconnect from the server
   * 
   * @param data - Array of documents to be inserted into the collection
   * @throws {Error} If any operation fails during the write process
   */
  async write(data: any[]): Promise<void> {
    try {
      await this.connect();
      const db = this.client.db(this.dbName);
      const collection = db.collection(this.collectionName);
      
      // Drop the collection if it exists
      await collection.drop().catch(() => {
        // Ignore error if collection doesn't exist
      });
      
      // Always insert data, even if empty
      await collection.insertMany(data);
    } catch (error) {
      throw error;
    } finally {
      await this.disconnect();
    }
  }
} 