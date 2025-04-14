import { MemoryWriter } from '../../writers/memory-writer';

describe('MemoryWriter', () => {
  let writer: MemoryWriter;
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];

  beforeEach(() => {
    writer = new MemoryWriter();
  });

  describe('write', () => {
    it('should store data in memory', async () => {
      await writer.write(testData);
      expect(writer.getData()).toEqual(testData);
    });

    it('should append data to existing memory', async () => {
      await writer.write(testData);
      await writer.write(testData);
      expect(writer.getData()).toEqual([...testData, ...testData]);
    });

    it('should handle empty data', async () => {
      await writer.write([]);
      expect(writer.getData()).toEqual([]);
    });
  });

  describe('getData', () => {
    it('should return empty array when no data is written', () => {
      expect(writer.getData()).toEqual([]);
    });

    it('should return written data', async () => {
      await writer.write(testData);
      expect(writer.getData()).toEqual(testData);
    });
  });
}); 