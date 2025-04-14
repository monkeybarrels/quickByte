import { Writer } from '../types';

/**
 * Memory Writer - Writes data to memory (for testing)
 */
export class MemoryWriter implements Writer {
  private data: any[] = [];

  async write(data: any[]): Promise<void> {
    this.data = [...this.data, ...data];
  }

  getData(): any[] {
    return this.data;
  }
} 