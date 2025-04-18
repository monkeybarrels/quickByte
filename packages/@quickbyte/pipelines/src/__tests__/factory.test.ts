import { defaultRegistry } from '../registry';
import { registerDefaultComponents, registerWriter, registerTransformer } from '../factory';
import { MemoryWriter } from '../writers';
import { Reader, Transformer, Writer, ReaderConfig, TransformerConfig, WriterConfig } from '../types';

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

      const memoryWriter = defaultRegistry.createWriter({ type: 'MEMORY', location: 'memory' });
      expect(memoryWriter).toBeInstanceOf(MemoryWriter);
    });

    it('should throw error for unknown writer type', () => {
      registerDefaultComponents();

      expect(() => defaultRegistry.createWriter({ type: 'UNKNOWN', location: 'unknown' }))
        .toThrow('Unknown writer type: UNKNOWN');
    });

    it('should throw error for unknown reader type', () => {
      registerDefaultComponents();

      expect(() => defaultRegistry.createReader({ type: 'UNKNOWN', location: 'unknown' }))
        .toThrow('Unknown reader type: UNKNOWN');
    });

    it('should throw error for unknown transformer type', () => {
      registerDefaultComponents();

      expect(() => defaultRegistry.createTransformer({ type: 'UNKNOWN' }))
        .toThrow('Unknown transformer type: UNKNOWN');
    });
  });

  describe('registerWriter', () => {
    it('should register a custom writer', () => {
      const customWriter: Writer = {
        write: async (data: any[]) => {
          console.log(data);
        }
      };

      registerWriter('CUSTOM', (config: WriterConfig) => customWriter);
      const writer = defaultRegistry.createWriter({ type: 'CUSTOM', location: 'custom' });
      
      expect(writer).toBe(customWriter);
    });

    it('should override existing writer registration', () => {
      const firstWriter: Writer = { write: async () => {} };
      const secondWriter: Writer = { write: async () => {} };

      registerWriter('CUSTOM', (config: WriterConfig) => firstWriter);
      registerWriter('CUSTOM', (config: WriterConfig) => secondWriter);
      
      const writer = defaultRegistry.createWriter({ type: 'CUSTOM', location: 'custom' });
      expect(writer).toBe(secondWriter);
    });

    it('should pass configuration to writer factory', () => {
      const config: WriterConfig = { type: 'CUSTOM', location: 'custom', options: { key: 'value' } };
      const customWriter: Writer = { write: async () => {} };
      const factory = jest.fn().mockReturnValue(customWriter);

      registerWriter('CUSTOM', factory);
      defaultRegistry.createWriter(config);
      
      expect(factory).toHaveBeenCalledWith(config);
    });
  });

  describe('registerTransformer', () => {
    it('should register a custom transformer', () => {
      const customTransformer: Transformer = {
        transform: async (data: any[]) => data
      };

      registerTransformer('CUSTOM', (config: TransformerConfig) => customTransformer);
      const transformer = defaultRegistry.createTransformer({ type: 'CUSTOM' });
      
      expect(transformer).toBe(customTransformer);
    });

    it('should override existing transformer registration', () => {
      const firstTransformer: Transformer = { transform: async (data: any[]) => data };
      const secondTransformer: Transformer = { transform: async (data: any[]) => data };

      registerTransformer('CUSTOM', (config: TransformerConfig) => firstTransformer);
      registerTransformer('CUSTOM', (config: TransformerConfig) => secondTransformer);
      
      const transformer = defaultRegistry.createTransformer({ type: 'CUSTOM' });
      expect(transformer).toBe(secondTransformer);
    });

    it('should pass configuration to transformer factory', () => {
      const config: TransformerConfig = { type: 'CUSTOM', options: { key: 'value' } };
      const customTransformer: Transformer = { transform: async (data: any[]) => data };
      const factory = jest.fn().mockReturnValue(customTransformer);

      registerTransformer('CUSTOM', factory);
      defaultRegistry.createTransformer(config);
      
      expect(factory).toHaveBeenCalledWith(config);
    });
  });
}); 