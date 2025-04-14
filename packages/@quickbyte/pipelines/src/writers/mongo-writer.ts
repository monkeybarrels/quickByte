import { MongoClient } from 'mongodb';
import { Writer } from '../types';

/**
 * MongoDB Writer - Writes data to a MongoDB collection
 */
export class MongoWriter implements Writer {
  private client: MongoClient;
  private dbName: string;
  private collectionName: string;
  private url: string;

  constructor(config: any) {
    this.url = config.location;
    this.dbName = config.options?.database;
    this.collectionName = config.options?.collection;
    this.client = new MongoClient(this.url);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

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