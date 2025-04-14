import { Writer } from '../types';
import { stringify as csvStringify } from 'csv-stringify/sync';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

/**
 * CSV Writer - Writes data to a CSV file
 */
export class CsvWriter implements Writer {
  private filePath: string;
  private options: Record<string, any>;

  constructor(config: any) {
    this.filePath = config.location || '';
    this.options = config.options || {};
  }

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