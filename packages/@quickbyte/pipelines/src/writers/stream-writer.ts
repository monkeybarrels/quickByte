import { Writer } from '../types';
import { Writable } from 'stream';

/**
 * StreamWriter is an implementation of the Writer interface that writes data to a writable stream.
 * This writer is useful for streaming data to files, network connections, or any other writable stream.
 * 
 * @implements {Writer}
 * @example
 * const writer = new StreamWriter(process.stdout);
 * await writer.write([{ id: 1, name: 'test' }]);
 */
export class StreamWriter<T = any> implements Writer<T> {
  private stream: Writable;

  /**
   * Creates a new StreamWriter instance
   * @param {Writable} stream - The writable stream to write data to
   */
  constructor(stream: Writable) {
    this.stream = stream;
  }

  /**
   * Writes data to the stream
   * @param {T[]} data - The data to write
   * @returns {Promise<void>}
   */
  async write(data: T[]): Promise<void> {
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

  /**
   * Connects to the stream (no-op for streams)
   * @returns {Promise<void>}
   */
  async connect(): Promise<void> {
    // No-op for streams
  }

  /**
   * Disconnects from the stream by ending it
   * @returns {Promise<void>}
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.stream.end(() => resolve());
    });
  }
} 