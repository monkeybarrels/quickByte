import { CsvWriter } from '../../writers/csv-writer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

describe('CsvWriter', () => {
  let writer: CsvWriter;
  const testData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ];
  const testFile = path.join(__dirname, 'test.csv');

  beforeEach(async () => {
    writer = new CsvWriter({
      location: testFile,
      options: {
        columns: ['id', 'name', 'age']
      }
    });
  });

  afterEach(async () => {
    try {
      await unlink(testFile);
    } catch (error) {
      // Ignore error if file doesn't exist
    }
  });

  describe('write', () => {
    it('should write data to CSV file', async () => {
      await writer.write(testData);
      const content = await readFile(testFile, 'utf8');
      expect(content).toBe('id,name,age\n1,John,30\n2,Jane,25\n');
    });

    it('should handle empty data', async () => {
      await writer.write([]);
      const content = await readFile(testFile, 'utf8');
      expect(content).toBe('id,name,age\n');
    });

    it('should handle missing columns', async () => {
      const data = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];
      await writer.write(data);
      const content = await readFile(testFile, 'utf8');
      expect(content).toBe('id,name,age\n1,John,\n2,Jane,\n');
    });
  });
}); 