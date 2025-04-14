import { Reader } from '../types';

export class MemoryReader implements Reader {
  private data: any;

  constructor(config: any) {
    this.data = config.options?.data || [];
  }

  async read(): Promise<any> {
    return this.data;
  }
} 