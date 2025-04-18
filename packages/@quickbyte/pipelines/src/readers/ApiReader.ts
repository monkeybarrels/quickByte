import { Reader } from '../types';
import axios from 'axios';

/**
 * A reader implementation that fetches data from an HTTP API endpoint.
 * Supports GET and POST methods and allows for response data path extraction.
 */
export class ApiReader implements Reader {
  /** The URL of the API endpoint to fetch data from */
  private url: string;
  /** The HTTP method to use for the request (GET or POST) */
  private method: string;
  /** HTTP headers to include in the request */
  private headers: Record<string, string>;
  /** Optional dot-notation path to extract specific data from the response */
  private responsePath?: string;

  /**
   * Creates a new ApiReader instance
   * @param config - Configuration object for the API reader
   * @param config.location - The URL of the API endpoint
   * @param config.options - Optional configuration for the API request
   * @param config.options.method - HTTP method to use (defaults to 'GET')
   * @param config.options.headers - HTTP headers to include in the request
   * @param config.options.responsePath - Optional dot-notation path to extract specific data from the response
   */
  constructor(config: any) {
    this.url = config.location || '';
    this.method = config.options?.method || 'GET';
    this.headers = config.options?.headers || {};
    this.responsePath = config.options?.responsePath;
  }

  /**
   * Fetches data from the configured API endpoint
   * @returns A promise that resolves to the API response data
   * @throws Error if the URL is not configured or if the API request fails
   */
  async read(): Promise<any> {
    if (!this.url) {
      throw new Error('API URL is required');
    }

    try {
      let response;
      if (this.method === 'GET') {
        response = await axios.get(this.url, { headers: this.headers });
      } else if (this.method === 'POST') {
        response = await axios.post(this.url, {}, { headers: this.headers });
      } else {
        throw new Error(`Unsupported HTTP method: ${this.method}`);
      }
      
      let data = response.data;
      
      if (this.responsePath) {
        data = this.getValueByPath(data, this.responsePath);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      throw error;
    }
  }

  /**
   * Extracts a value from an object using a dot-notation path
   * @param obj - The object to extract the value from
   * @param path - The dot-notation path to the desired value
   * @returns The value at the specified path, or undefined if the path doesn't exist
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc === undefined || acc === null) {
        return undefined;
      }
      return acc[part];
    }, obj);
  }
} 