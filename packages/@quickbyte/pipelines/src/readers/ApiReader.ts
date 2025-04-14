import { Reader } from '../types';
import axios from 'axios';

export class ApiReader implements Reader {
  private url: string;
  private method: string;
  private headers: Record<string, string>;
  private responsePath?: string;

  constructor(config: any) {
    this.url = config.location || '';
    this.method = config.options?.method || 'GET';
    this.headers = config.options?.headers || {};
    this.responsePath = config.options?.responsePath;
  }

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

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
      if (acc === undefined || acc === null) {
        return undefined;
      }
      return acc[part];
    }, obj);
  }
} 