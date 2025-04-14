import { FieldMappingTransformer } from '../../transformers/FieldMappingTransformer';

describe('FieldMappingTransformer', () => {
  let transformer: FieldMappingTransformer;
  const testData = [
    { id: 1, name: 'John', age: 30, address: { city: 'New York' } },
    { id: 2, name: 'Jane', age: 25, address: { city: 'Los Angeles' } }
  ];

  describe('constructor', () => {
    it('should initialize with default values', () => {
      transformer = new FieldMappingTransformer({});
      expect(transformer).toBeDefined();
    });

    it('should initialize with custom field mapping', () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'name': 'fullName',
          'age': 'years'
        }
      });
      expect(transformer).toBeDefined();
    });
  });

  describe('transform', () => {
    it('should map fields according to fieldMap', async () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'name': 'fullName',
          'age': 'years'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { fullName: 'John', years: 30 },
        { fullName: 'Jane', years: 25 }
      ]);
    });

    it('should handle nested field paths', async () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'address.city': 'location'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { location: 'New York' },
        { location: 'Los Angeles' }
      ]);
    });

    it('should handle missing fields', async () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'name': 'fullName',
          'nonExistent': 'missing'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { fullName: 'John' },
        { fullName: 'Jane' }
      ]);
    });

    it('should handle empty input data', async () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'name': 'fullName'
        }
      });

      const result = await transformer.transform([]);
      expect(result).toEqual([]);
    });

    it('should handle complex field mappings', async () => {
      transformer = new FieldMappingTransformer({
        fieldMap: {
          'name': 'personal.fullName',
          'age': 'personal.years',
          'address.city': 'location.city'
        }
      });

      const result = await transformer.transform(testData);
      expect(result).toEqual([
        { 
          personal: { fullName: 'John', years: 30 },
          location: { city: 'New York' }
        },
        { 
          personal: { fullName: 'Jane', years: 25 },
          location: { city: 'Los Angeles' }
        }
      ]);
    });
  });
}); 