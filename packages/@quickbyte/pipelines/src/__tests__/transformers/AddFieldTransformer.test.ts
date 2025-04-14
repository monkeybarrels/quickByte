import { AddFieldTransformer } from '../../transformers/AddFieldTransformer';

describe('AddFieldTransformer', () => {
  let transformer: AddFieldTransformer;
  const testData = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];

  describe('constructor', () => {
    it('should initialize with default values', () => {
      transformer = new AddFieldTransformer({});
      expect(transformer).toBeDefined();
    });

    it('should initialize with custom values', () => {
      transformer = new AddFieldTransformer({
        field: 'status',
        value: 'active'
      });
      expect(transformer).toBeDefined();
    });
  });

  describe('transform', () => {
    it('should add field to all records', async () => {
      transformer = new AddFieldTransformer({
        field: 'status',
        value: 'active'
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', status: 'active' },
        { id: 2, name: 'Jane', status: 'active' }
      ]);
    });

    it('should handle empty input data', async () => {
      transformer = new AddFieldTransformer({
        field: 'status',
        value: 'active'
      });

      const result = await transformer.transform([]);
      expect(result).toEqual([]);
    });

    it('should handle nested field paths', async () => {
      transformer = new AddFieldTransformer({
        field: 'metadata.status',
        value: 'active'
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', metadata: { status: 'active' } },
        { id: 2, name: 'Jane', metadata: { status: 'active' } }
      ]);
    });

    it('should handle complex value types', async () => {
      const complexValue = { status: 'active', timestamp: new Date() };
      transformer = new AddFieldTransformer({
        field: 'metadata',
        value: complexValue
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', metadata: complexValue },
        { id: 2, name: 'Jane', metadata: complexValue }
      ]);
    });
  });
}); 