import { CsvReader } from '../../readers/CsvReader';
import { readFileSync } from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

jest.mock('fs');
jest.mock('csv-parse/sync');

describe('CsvReader', () => {
  let csvReader: CsvReader;
  const mockCsvContent = 'id,name,age\n1,John,30\n2,Jane,25';
  const mockParsedData = [
    { id: '1', name: 'John', age: '30' },
    { id: '2', name: 'Jane', age: '25' }
  ];

  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(mockCsvContent);
    (csvParse as jest.Mock).mockReturnValue(mockParsedData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      csvReader = new CsvReader({});
      expect(csvReader).toBeDefined();
    });

    it('should initialize with custom values', () => {
      const config = {
        location: 'data.csv',
        options: { delimiter: ';', skip_empty_lines: false }
      };
      csvReader = new CsvReader(config);
      expect(csvReader).toBeDefined();
    });
  });

  describe('read', () => {
    it('should throw error when file path is not provided', async () => {
      csvReader = new CsvReader({});
      await expect(csvReader.read()).rejects.toThrow('CSV file path is required');
    });

    it('should read and parse CSV file successfully', async () => {
      csvReader = new CsvReader({
        location: 'data.csv'
      });

      const result = await csvReader.read();
      expect(readFileSync).toHaveBeenCalledWith('data.csv', 'utf-8');
      expect(csvParse).toHaveBeenCalledWith(mockCsvContent, {
        columns: true,
        skip_empty_lines: true,
      });
      expect(result).toEqual(mockParsedData);
    });

    it('should apply custom CSV parsing options', async () => {
      const customOptions = {
        delimiter: ';',
        skip_empty_lines: false
      };

      csvReader = new CsvReader({
        location: 'data.csv',
        options: customOptions
      });

      await csvReader.read();
      expect(csvParse).toHaveBeenCalledWith(mockCsvContent, {
        columns: true,
        ...customOptions
      });
    });

    it('should handle file read errors', async () => {
      const error = new Error('File not found');
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      csvReader = new CsvReader({
        location: 'nonexistent.csv'
      });

      await expect(csvReader.read()).rejects.toThrow('File not found');
    });
  });
}); 