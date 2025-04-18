import { Reader } from '../types';

/**
 * A reader implementation that reads data from memory.
 * This reader is useful for testing or when data is already available in memory.
 */
export class MemoryReader implements Reader {
  private data: any;

  /**
   * Creates a new MemoryReader instance.
   * @param config - Configuration object for the reader
   * @param config.options - Optional configuration options
   * @param config.options.data - The data to be read from memory. Defaults to an empty array if not provided.
   */
  constructor(config: any) {
    this.data = config.options?.data || [];
  }

  /**
   * Reads the data stored in memory.
   * @returns A promise that resolves to the data stored in memory
   */
  async read(): Promise<any> {
    return this.data;
  }
} 