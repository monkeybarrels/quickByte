import { defaultRegistry } from '../registry';
import { registerDefaultComponents } from '../factory';
import { ApiReader, CsvReader, MongoReader, MemoryReader } from '../readers';
import { FieldMappingTransformer, FilterTransformer, MapTransformer, AddFieldTransformer } from '../transformers';
import { CsvWriter, MongoWriter, ApiWriter, MemoryWriter } from '../writers';

describe('Factory', () => {
  beforeEach(() => {
    // Clear the registry before each test
    defaultRegistry.readers = {};
    defaultRegistry.transformers = {};
    defaultRegistry.writers = {};
  });

  describe('registerDefaultComponents', () => {
    it('should register all default readers', () => {
      registerDefaultComponents();

      // Test API reader
      const apiReader = defaultRegistry.createReader({ type: 'API' });
      expect(apiReader).toBeInstanceOf(ApiReader);

      // Test CSV reader
      const csvReader = defaultRegistry.createReader({ type: 'CSV' });
      expect(csvReader).toBeInstanceOf(CsvReader);

      // Test MongoDB reader
      const mongoReader = defaultRegistry.createReader({ type: 'MONGODB' });
      expect(mongoReader).toBeInstanceOf(MongoReader);

      // Test Memory reader
      const memoryReader = defaultRegistry.createReader({ type: 'MEMORY' });
      expect(memoryReader).toBeInstanceOf(MemoryReader);
    });

    it('should register all default transformers', () => {
      registerDefaultComponents();

      // Test FieldMapping transformer
      const fieldMappingTransformer = defaultRegistry.createTransformer({ type: 'FIELD_MAPPING' });
      expect(fieldMappingTransformer).toBeInstanceOf(FieldMappingTransformer);

      // Test Filter transformer
      const filterTransformer = defaultRegistry.createTransformer({ type: 'FILTER' });
      expect(filterTransformer).toBeInstanceOf(FilterTransformer);

      // Test Map transformer
      const mapTransformer = defaultRegistry.createTransformer({ type: 'MAP' });
      expect(mapTransformer).toBeInstanceOf(MapTransformer);

      // Test AddField transformer
      const addFieldTransformer = defaultRegistry.createTransformer({ type: 'ADD_FIELD' });
      expect(addFieldTransformer).toBeInstanceOf(AddFieldTransformer);
    });

    it('should register all default writers', () => {
      registerDefaultComponents();

      // Test CSV writer
      const csvWriter = defaultRegistry.createWriter({ type: 'CSV' });
      expect(csvWriter).toBeInstanceOf(CsvWriter);

      // Test MongoDB writer
      const mongoWriter = defaultRegistry.createWriter({
        type: 'MONGODB',
        location: 'mongodb://localhost:27017',
        options: {
          database: 'test',
          collection: 'test'
        }
      });
      expect(mongoWriter).toBeInstanceOf(MongoWriter);

      // Test API writer
      const apiWriter = defaultRegistry.createWriter({ type: 'API' });
      expect(apiWriter).toBeInstanceOf(ApiWriter);

      // Test Memory writer
      const memoryWriter = defaultRegistry.createWriter({ type: 'MEMORY' });
      expect(memoryWriter).toBeInstanceOf(MemoryWriter);
    });

    it('should throw error for unknown component types', () => {
      registerDefaultComponents();

      // Test unknown reader type
      expect(() => defaultRegistry.createReader({ type: 'UNKNOWN' }))
        .toThrow('Unknown reader type: UNKNOWN');

      // Test unknown transformer type
      expect(() => defaultRegistry.createTransformer({ type: 'UNKNOWN' }))
        .toThrow('Unknown transformer type: UNKNOWN');

      // Test unknown writer type
      expect(() => defaultRegistry.createWriter({ type: 'UNKNOWN' }))
        .toThrow('Unknown writer type: UNKNOWN');
    });
  });
}); 