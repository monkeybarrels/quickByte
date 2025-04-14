import { Reader } from '../types';
import { MongoClient } from 'mongodb';

export class MongoReader implements Reader {
  private client: MongoClient | null = null;
  private url: string;
  private dbName: string;
  private collectionName: string;
  private query: Record<string, any>;

  constructor(config: any) {
    this.url = config.location || '';
    this.dbName = config.location?.split('/').pop()?.split('?')[0] || 'default';
    this.collectionName = config.collection || 'default';
    this.query = config.query || {};
  }

  async connect(): Promise<void> {
    if (!this.url) {
      throw new Error('MongoDB connection string is required');
    }
    
    this.client = new MongoClient(this.url);
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async read(): Promise<any[]> {
    if (!this.client) {
      throw new Error('MongoDB client not connected');
    }

    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);
    
    return collection.find(this.query).toArray();
  }
} 