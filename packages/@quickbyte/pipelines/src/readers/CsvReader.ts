import { Reader } from '../types';
import { readFileSync } from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

export class CsvReader implements Reader {
  private filePath: string;
  private options: Record<string, any>;

  constructor(config: any) {
    this.filePath = config.location || '';
    this.options = config.options || {};
  }

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