import { Writer, CsvWriterConfig } from '../types';
import { stringify as csvStringify } from 'csv-stringify/sync';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

/**
 * CsvWriter is an implementation of the Writer interface that writes data to a CSV file.
 * This writer handles the file path and options configuration for CSV file writing.
 * It automatically creates the output directory if it doesn't exist and formats the data
 * according to the specified options.
 * 
 * @implements {Writer}
 * @example
 * const writer = new CsvWriter({ 
 *   location: 'output.csv', 
 *   options: { 
 *     columns: ['id', 'name'],
 *     headers: true 
 *   } 
 * });
 * await writer.write([{ id: 1, name: 'test' }]);
 */
export class CsvWriter implements Writer {
  private filePath: string;
  private options: Record<string, any>;

  /**
   * Creates a new CsvWriter instance
   * @param {CsvWriterConfig} config - Configuration for the CSV writer
   */
  constructor(config: CsvWriterConfig) {
    this.filePath = config.location || '';
    this.options = config.options || {};
  }

  /**
   * Writes the provided data to a CSV file
   * @param {any[]} data - Array of objects to be written to the CSV file
   * @throws {Error} If the file path is not provided
   * @returns {Promise<void>}
   */
  async write(data: any[]): Promise<void> {
    if (!this.filePath) {
      throw new Error('CSV file path is required');
    }

    // Get fields from options or data
    const fields: string[] = this.options.columns || 
      Array.from(new Set(data.flatMap(record => Object.keys(record))));

    // Format the data to ensure all fields are included and values are properly formatted
    const formattedData = data.map(record => {
      const formattedRecord: Record<string, any> = {};
      fields.forEach(field => {
        const value = record[field];
        if (value === undefined || value === null) {
          formattedRecord[field] = '';
        } else if (typeof value === 'boolean') {
          formattedRecord[field] = value ? 'true' : 'false';
        } else if (typeof value === 'object') {
          // Skip fields that are not in the columns list
          if (this.options.columns && !this.options.columns.includes(field)) {
            return;
          }
          formattedRecord[field] = JSON.stringify(value);
        } else {
          formattedRecord[field] = value;
        }
      });
      return formattedRecord;
    });

    const csvContent = csvStringify(formattedData, {
      header: this.options.headers !== false,
      columns: fields
    });
    
    // Create directory if it doesn't exist
    const directory = dirname(this.filePath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
    
    writeFileSync(this.filePath, csvContent);
  }
} 