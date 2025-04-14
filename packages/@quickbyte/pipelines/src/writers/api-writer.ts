import { Writer } from '../types';
import axios from 'axios';

/**
 * API Writer - Writes data to an API endpoint
 */
export class ApiWriter implements Writer {
  private url: string;
  private method: string;
  private headers: Record<string, string>;
  private batchSize: number;

  constructor(config: any) {
    this.url = config.location || '';
    this.method = config.options?.method || 'POST';
    this.headers = config.options?.headers || {};
    this.batchSize = config.options?.batchSize || 1;
  }

  async write(data: any[]): Promise<void> {
    if (!this.url) {
      throw new Error('API URL is required');
    }

    try {
      if (this.method === 'POST') {
        await axios.post(this.url, data, { headers: this.headers });
      } else if (this.method === 'PUT') {
        await axios.put(this.url, data, { headers: this.headers });
      } else {
        throw new Error(`Unsupported HTTP method: ${this.method}`);
      }
    } catch (error) {
      console.error('Error writing data to API:', error);
      throw error;
    }
  }
} 