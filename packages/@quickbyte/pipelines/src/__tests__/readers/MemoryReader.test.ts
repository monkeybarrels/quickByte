import { MemoryReader } from '../../readers/MemoryReader';

describe('MemoryReader', () => {
  let memoryReader: MemoryReader;

  describe('constructor', () => {
    it('should initialize with empty data when no config provided', () => {
      memoryReader = new MemoryReader({});
      expect(memoryReader).toBeDefined();
    });

    it('should initialize with provided data', () => {
      const testData = [{ id: 1, name: 'Test' }];
      memoryReader = new MemoryReader({
        options: { data: testData }
      });
      expect(memoryReader).toBeDefined();
    });
  });

  describe('read', () => {
    it('should return empty array when no data provided', async () => {
      memoryReader = new MemoryReader({});
      const result = await memoryReader.read();
      expect(result).toEqual([]);
    });

    it('should return provided data', async () => {
      const testData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      memoryReader = new MemoryReader({
        options: { data: testData }
      });
      const result = await memoryReader.read();
      expect(result).toEqual(testData);
    });

    it('should return non-array data as is', async () => {
      const testData = { id: 1, name: 'Test' };
      memoryReader = new MemoryReader({
        options: { data: testData }
      });
      const result = await memoryReader.read();
      expect(result).toEqual(testData);
    });
  });
}); 