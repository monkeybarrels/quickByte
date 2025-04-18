import { Writer } from '../types';
import axios from 'axios';

/**
 * API Writer - Writes data to an API endpoint
 * 
 * This writer implementation sends data to a specified API endpoint using HTTP methods.
 * It supports both POST and PUT methods and allows for custom headers and batch processing.
 */
export class ApiWriter implements Writer {
  private url: string;
  private method: string;
  private headers: Record<string, string>;
  private batchSize: number;

  /**
   * Creates a new API Writer instance
   * @param {Object} config - Configuration object for the API writer
   * @param {string} config.location - The URL endpoint to write data to
   * @param {Object} [config.options] - Additional configuration options
   * @param {string} [config.options.method='POST'] - HTTP method to use (POST or PUT)
   * @param {Record<string, string>} [config.options.headers={}] - Custom headers to include in requests
   * @param {number} [config.options.batchSize=1] - Number of items to send in each request
   */
  constructor(config: any) {
    this.url = config.location || '';
    this.method = config.options?.method || 'POST';
    this.headers = config.options?.headers || {};
    this.batchSize = config.options?.batchSize || 1;
  }

  /**
   * Writes data to the configured API endpoint
   * @param {any[]} data - Array of data items to write to the API
   * @throws {Error} If the API URL is not configured or an unsupported HTTP method is specified
   * @throws {Error} If the API request fails
   */
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