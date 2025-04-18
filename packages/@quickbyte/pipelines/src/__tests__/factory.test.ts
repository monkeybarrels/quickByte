import { defaultRegistry } from '../registry';
import { registerDefaultComponents, registerWriter, registerTransformer } from '../factory';
import { MemoryWriter } from '../writers';

describe('Factory', () => {
  beforeEach(() => {
    // Clear the registry before each test
    defaultRegistry.readers = {};
    defaultRegistry.transformers = {};
    defaultRegistry.writers = {};
  });

  describe('registerDefaultComponents', () => {
    it('should register MemoryWriter', () => {
      registerDefaultComponents();

      const memoryWriter = defaultRegistry.createWriter({ type: 'MEMORY' });
      expect(memoryWriter).toBeInstanceOf(MemoryWriter);
    });

    it('should throw error for unknown component types', () => {
      registerDefaultComponents();

      expect(() => defaultRegistry.createWriter({ type: 'UNKNOWN' }))
        .toThrow('Unknown writer type: UNKNOWN');
    });
  });

  describe('registerWriter', () => {
    it('should register a custom writer', () => {
      const customWriter = {
        write: async (data: any) => {
          console.log(data);
        }
      };

      registerWriter('CUSTOM', () => customWriter);
      const writer = defaultRegistry.createWriter({ type: 'CUSTOM' });
      
      expect(writer).toBe(customWriter);
    });

    it('should override existing writer registration', () => {
      const firstWriter = { write: async () => {} };
      const secondWriter = { write: async () => {} };

      registerWriter('CUSTOM', () => firstWriter);
      registerWriter('CUSTOM', () => secondWriter);
      
      const writer = defaultRegistry.createWriter({ type: 'CUSTOM' });
      expect(writer).toBe(secondWriter);
    });
  });

  describe('registerTransformer', () => {
    it('should register a custom transformer', () => {
      const customTransformer = {
        transform: async (data: any) => data
      };

      registerTransformer('CUSTOM', () => customTransformer);
      const transformer = defaultRegistry.createTransformer({ type: 'CUSTOM' });
      
      expect(transformer).toBe(customTransformer);
    });

    it('should override existing transformer registration', () => {
      const firstTransformer = { transform: async (data: any) => data };
      const secondTransformer = { transform: async (data: any) => data };

      registerTransformer('CUSTOM', () => firstTransformer);
      registerTransformer('CUSTOM', () => secondTransformer);
      
      const transformer = defaultRegistry.createTransformer({ type: 'CUSTOM' });
      expect(transformer).toBe(secondTransformer);
    });
  });
}); 