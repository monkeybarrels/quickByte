import { Reader } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Configuration for the FileReader
 */
export interface FileReaderConfig {
  /**
   * Path to the file to read
   */
  path: string;
  
  /**
   * Optional encoding for the file (defaults to 'utf-8')
   */
  encoding?: BufferEncoding;
  
  /**
   * Optional flag to parse JSON content (defaults to false)
   */
  parseJson?: boolean;
}

/**
 * FileReader - A reader that reads data from a local file
 * 
 * @example
 * ```typescript
 * import { registerReader } from '@quickbyte/pipelines';
 * import { FileReader } from './readers/file-reader';
 * 
 * // Register the file reader
 * registerReader('file', (config) => new FileReader(config));
 * 
 * // Use in a pipeline
 * const pipeline = new FlexiblePipeline({
 *   reader: {
 *     type: 'file',
 *     path: './data.json',
 *     parseJson: true
 *   },
 *   writer: yourWriter
 * });
 * ```
 */
export class FileReader implements Reader {
  private config: FileReaderConfig;
  private fileHandle?: fs.FileHandle;

  constructor(config: FileReaderConfig) {
    this.config = {
      encoding: 'utf-8',
      parseJson: false,
      ...config
    };
  }

  async connect(): Promise<void> {
    // No need to connect for file reading
  }

  async read(): Promise<any> {
    try {
      const filePath = path.resolve(this.config.path);
      const content = await fs.readFile(filePath, { encoding: this.config.encoding });
      
      if (this.config.parseJson) {
        return JSON.parse(content as string);
      }
      
      return content;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read file ${this.config.path}: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    // No need to disconnect for file reading
  }
} 