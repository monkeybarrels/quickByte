import { Reader } from '../types';
import { readFileSync } from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

/**
 * A reader implementation for CSV files that implements the Reader interface.
 * This class provides functionality to read and parse CSV files with configurable options.
 */
export class CsvReader implements Reader {
  private filePath: string;
  private options: Record<string, any>;

  /**
   * Creates a new CsvReader instance with the specified configuration.
   * @param config - Configuration object containing:
   * @param config.location - The path to the CSV file to read
   * @param config.options - Optional configuration options for CSV parsing
   */
  constructor(config: any) {
    this.filePath = config.location || '';
    this.options = config.options || {};
  }

  /**
   * Reads and parses the CSV file specified in the configuration.
   * @returns A promise that resolves to an array of objects, where each object represents a row from the CSV file.
   * @throws {Error} If the file path is not specified in the configuration
   */
  async read(): Promise<any[]> {
    if (!this.filePath) {
      throw new Error('CSV file path is required');
    }

    const fileContent = readFileSync(this.filePath, 'utf-8');
    return csvParse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      ...this.options
    });
  }
} 