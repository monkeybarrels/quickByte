import { FilterTransformer } from '../../transformers/FilterTransformer';

describe('FilterTransformer', () => {
  let transformer: FilterTransformer;
  const testData = [
    { id: 1, name: 'John', age: 30, active: true, role: 'admin', tags: ['admin', 'user'] },
    { id: 2, name: 'Jane', age: 25, active: false, role: 'user', tags: ['user'] },
    { id: 3, name: 'Bob', age: 35, active: true, role: 'admin', tags: ['admin'] }
  ];

  describe('constructor', () => {
    it('should initialize with default values', () => {
      transformer = new FilterTransformer({});
      expect(transformer).toBeDefined();
    });

    it('should initialize with custom condition', () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'age',
          operator: 'GREATER_THAN',
          value: 30
        }
      });
      expect(transformer).toBeDefined();
    });
  });

  describe('transform', () => {
    it('should filter records with EQUALS operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'name',
          operator: 'EQUALS',
          value: 'John'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', age: 30, active: true, role: 'admin', tags: ['admin', 'user'] }
      ]);
    });

    it('should filter records with NOT_EQUALS operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'name',
          operator: 'NOT_EQUALS',
          value: 'John'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 2, name: 'Jane', age: 25, active: false, role: 'user', tags: ['user'] },
        { id: 3, name: 'Bob', age: 35, active: true, role: 'admin', tags: ['admin'] }
      ]);
    });

    it('should filter records with GREATER_THAN operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'age',
          operator: 'GREATER_THAN',
          value: 30
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 3, name: 'Bob', age: 35, active: true, role: 'admin', tags: ['admin'] }
      ]);
    });

    it('should filter records with LESS_THAN operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'age',
          operator: 'LESS_THAN',
          value: 30
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 2, name: 'Jane', age: 25, active: false, role: 'user', tags: ['user'] }
      ]);
    });

    it('should filter records with IN operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'role',
          operator: 'IN',
          value: ['admin', 'user']
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', age: 30, active: true, role: 'admin', tags: ['admin', 'user'] },
        { id: 2, name: 'Jane', age: 25, active: false, role: 'user', tags: ['user'] },
        { id: 3, name: 'Bob', age: 35, active: true, role: 'admin', tags: ['admin'] }
      ]);
    });

    it('should filter records with NOT_IN operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'role',
          operator: 'NOT_IN',
          value: ['admin']
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 2, name: 'Jane', age: 25, active: false, role: 'user', tags: ['user'] }
      ]);
    });

    it('should filter records with EXISTS operator', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'active',
          operator: 'EXISTS',
          value: true
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { id: 1, name: 'John', age: 30, active: true, role: 'admin', tags: ['admin', 'user'] },
        { id: 3, name: 'Bob', age: 35, active: true, role: 'admin', tags: ['admin'] }
      ]);
    });

    it('should handle nested field paths', async () => {
      const nestedData = [
        { id: 1, user: { name: 'John', age: 30 } },
        { id: 2, user: { name: 'Jane', age: 25 } }
      ];

      transformer = new FilterTransformer({
        condition: {
          field: 'user.age',
          operator: 'GREATER_THAN',
          value: 25
        }
      });

      const result = await transformer.transform(nestedData);
      expect(result).toEqual([
        { id: 1, user: { name: 'John', age: 30 } }
      ]);
    });

    it('should handle empty input data', async () => {
      transformer = new FilterTransformer({
        condition: {
          field: 'name',
          operator: 'EQUALS',
          value: 'John'
        }
      });

      const result = await transformer.transform([]);
      expect(result).toEqual([]);
    });
  });
}); 