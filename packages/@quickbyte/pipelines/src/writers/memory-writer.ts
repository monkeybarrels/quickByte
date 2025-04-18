import { Writer } from '../types';

/**
 * MemoryWriter is an implementation of the Writer interface that stores data in memory.
 * This class is primarily used for testing purposes where persistent storage is not required.
 * 
 * @example
 * const writer = new MemoryWriter();
 * await writer.write([{ id: 1, name: 'test' }]);
 * const data = writer.getData();
 */
export class MemoryWriter implements Writer {
  private data: any[] = [];

  /**
   * Writes data to memory by appending it to the existing data array.
   * 
   * @param data - An array of data to be written to memory
   * @returns A Promise that resolves when the data has been written
   */
  async write(data: any[]): Promise<void> {
    this.data = [...this.data, ...data];
  }

  /**
   * Retrieves all data that has been written to memory.
   * 
   * @returns An array containing all data that has been written
   */
  getData(): any[] {
    return this.data;
  }
} 