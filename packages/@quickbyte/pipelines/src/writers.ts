import { Writer } from './types';
import { Writable } from 'stream';

/**
 * MemoryWriter - A writer that stores data in memory
 * Useful for testing or when you need to access the written data
 */
export class MemoryWriter<T = any> implements Writer<T> {
  private data: T | null = null;

  /**
   * Get the stored data
   */
  getData(): T | null {
    return this.data;
  }

  /**
   * Clear the stored data
   */
  clear(): void {
    this.data = null;
  }

  async write(data: T): Promise<void> {
    this.data = data;
  }
}

/**
 * StreamWriter - A writer that writes data to a writable stream
 * Useful for streaming data to files, network connections, etc.
 */
export class StreamWriter<T = any> implements Writer<T> {
  private stream: Writable;

  constructor(stream: Writable) {
    this.stream = stream;
  }

  async write(data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const stringData = JSON.stringify(data);
      this.stream.write(stringData, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async connect(): Promise<void> {
    // No-op for streams
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.stream.end(() => resolve());
    });
  }
} 