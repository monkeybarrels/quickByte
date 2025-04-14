import { MapTransformer } from '../../transformers/MapTransformer';

describe('MapTransformer', () => {
  let transformer: MapTransformer;
  const testData = [
    { id: 1, name: ' John ', age: '30', active: 'true', data: '{"key":"value"}' },
    { id: 2, name: ' Jane ', age: '25', active: 'false', data: '{"key":"value"}' }
  ];

  describe('constructor', () => {
    it('should initialize with default values', () => {
      transformer = new MapTransformer({});
      expect(transformer).toBeDefined();
    });

    it('should initialize with custom operations', () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TRIM' },
          { field: 'age', operation: 'NUMBER' }
        ]
      });
      expect(transformer).toBeDefined();
    });
  });

  describe('transform', () => {
    it('should apply TO_UPPER_CASE operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TO_UPPER_CASE' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' JOHN ', age: '30', active: 'true', data: '{"key":"value"}' },
        { id: 2, name: ' JANE ', age: '25', active: 'false', data: '{"key":"value"}' }
      ]);
    });

    it('should apply TO_LOWER_CASE operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TO_LOWER_CASE' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' john ', age: '30', active: 'true', data: '{"key":"value"}' },
        { id: 2, name: ' jane ', age: '25', active: 'false', data: '{"key":"value"}' }
      ]);
    });

    it('should apply TRIM operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TRIM' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', age: '30', active: 'true', data: '{"key":"value"}' },
        { id: 2, name: 'Jane', age: '25', active: 'false', data: '{"key":"value"}' }
      ]);
    });

    it('should apply NUMBER operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'age', operation: 'NUMBER' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' John ', age: 30, active: 'true', data: '{"key":"value"}' },
        { id: 2, name: ' Jane ', age: 25, active: 'false', data: '{"key":"value"}' }
      ]);
    });

    it('should apply STRING operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'age', operation: 'STRING' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' John ', age: '30', active: 'true', data: '{"key":"value"}' },
        { id: 2, name: ' Jane ', age: '25', active: 'false', data: '{"key":"value"}' }
      ]);
    });

    it('should apply BOOLEAN operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'active', operation: 'BOOLEAN' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' John ', age: '30', active: true, data: '{"key":"value"}' },
        { id: 2, name: ' Jane ', age: '25', active: false, data: '{"key":"value"}' }
      ]);
    });

    it('should apply PARSE_JSON operation', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'data', operation: 'PARSE_JSON' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: ' John ', age: '30', active: 'true', data: { key: 'value' } },
        { id: 2, name: ' Jane ', age: '25', active: 'false', data: { key: 'value' } }
      ]);
    });

    it('should apply STRINGIFY_JSON operation', async () => {
      const jsonData = [
        { id: 1, data: { key: 'value' } },
        { id: 2, data: { key: 'value' } }
      ];

      transformer = new MapTransformer({
        operations: [
          { field: 'data', operation: 'STRINGIFY_JSON' }
        ]
      });

      const result = await transformer.transform(jsonData);
      expect(result).toEqual([
        { id: 1, data: '{"key":"value"}' },
        { id: 2, data: '{"key":"value"}' }
      ]);
    });

    it('should handle multiple operations', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TRIM' },
          { field: 'age', operation: 'NUMBER' },
          { field: 'active', operation: 'BOOLEAN' },
          { field: 'data', operation: 'PARSE_JSON' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', age: 30, active: true, data: { key: 'value' } },
        { id: 2, name: 'Jane', age: 25, active: false, data: { key: 'value' } }
      ]);
    });

    it('should handle non-existent fields', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'nonExistent', operation: 'TRIM' }
        ]
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual(testData);
    });

    it('should handle empty input data', async () => {
      transformer = new MapTransformer({
        operations: [
          { field: 'name', operation: 'TRIM' }
        ]
      });

      const result = await transformer.transform([]);
      expect(result).toEqual([]);
    });
  });
}); 