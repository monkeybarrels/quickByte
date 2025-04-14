import { Registry } from '../registry';
import { Reader, Writer, Transformer } from '../types';

describe('Registry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
  });

  describe('Reader Registration', () => {
    it('should register and create a reader', () => {
      const mockReader: Reader = {
        read: jest.fn()
      };
      const readerFactory = jest.fn().mockReturnValue(mockReader);
      
      registry.registerReader('TEST', readerFactory);
      const reader = registry.createReader({ type: 'TEST' });
      
      expect(reader).toBe(mockReader);
      expect(readerFactory).toHaveBeenCalledWith({ type: 'TEST' });
    });

    it('should throw error when creating unknown reader type', () => {
      expect(() => registry.createReader({ type: 'UNKNOWN' }))
        .toThrow('Unknown reader type: UNKNOWN');
    });

    it('should pass configuration to reader factory', () => {
      const readerFactory = jest.fn().mockReturnValue({
        read: jest.fn()
      });
      const config = {
        type: 'TEST',
        location: 'test-location',
        options: { key: 'value' }
      };
      
      registry.registerReader('TEST', readerFactory);
      registry.createReader(config);
      
      expect(readerFactory).toHaveBeenCalledWith(config);
    });
  });

  describe('Transformer Registration', () => {
    it('should register and create a transformer', () => {
      const mockTransformer: Transformer = {
        transform: jest.fn()
      };
      const transformerFactory = jest.fn().mockReturnValue(mockTransformer);
      
      registry.registerTransformer('TEST', transformerFactory);
      const transformer = registry.createTransformer({ type: 'TEST' });
      
      expect(transformer).toBe(mockTransformer);
      expect(transformerFactory).toHaveBeenCalledWith({ type: 'TEST' });
    });

    it('should throw error when creating unknown transformer type', () => {
      expect(() => registry.createTransformer({ type: 'UNKNOWN' }))
        .toThrow('Unknown transformer type: UNKNOWN');
    });

    it('should pass configuration to transformer factory', () => {
      const transformerFactory = jest.fn().mockReturnValue({
        transform: jest.fn()
      });
      const config = {
        type: 'TEST',
        fieldMap: { key: 'value' }
      };
      
      registry.registerTransformer('TEST', transformerFactory);
      registry.createTransformer(config);
      
      expect(transformerFactory).toHaveBeenCalledWith(config);
    });
  });

  describe('Writer Registration', () => {
    it('should register and create a writer', () => {
      const mockWriter: Writer = {
        write: jest.fn()
      };
      const writerFactory = jest.fn().mockReturnValue(mockWriter);
      
      registry.registerWriter('TEST', writerFactory);
      const writer = registry.createWriter({ type: 'TEST' });
      
      expect(writer).toBe(mockWriter);
      expect(writerFactory).toHaveBeenCalledWith({ type: 'TEST' });
    });

    it('should throw error when creating unknown writer type', () => {
      expect(() => registry.createWriter({ type: 'UNKNOWN' }))
        .toThrow('Unknown writer type: UNKNOWN');
    });

    it('should pass configuration to writer factory', () => {
      const writerFactory = jest.fn().mockReturnValue({
        write: jest.fn()
      });
      const config = {
        type: 'TEST',
        location: 'test-location',
        options: { key: 'value' }
      };
      
      registry.registerWriter('TEST', writerFactory);
      registry.createWriter(config);
      
      expect(writerFactory).toHaveBeenCalledWith(config);
    });
  });

  describe('Multiple Components', () => {
    it('should handle multiple components of each type', () => {
      const mockReader1 = { read: jest.fn() };
      const mockReader2 = { read: jest.fn() };
      const mockTransformer1 = { transform: jest.fn() };
      const mockTransformer2 = { transform: jest.fn() };
      const mockWriter1 = { write: jest.fn() };
      const mockWriter2 = { write: jest.fn() };

      registry.registerReader('TEST1', () => mockReader1);
      registry.registerReader('TEST2', () => mockReader2);
      registry.registerTransformer('TEST1', () => mockTransformer1);
      registry.registerTransformer('TEST2', () => mockTransformer2);
      registry.registerWriter('TEST1', () => mockWriter1);
      registry.registerWriter('TEST2', () => mockWriter2);

      expect(registry.createReader({ type: 'TEST1' })).toBe(mockReader1);
      expect(registry.createReader({ type: 'TEST2' })).toBe(mockReader2);
      expect(registry.createTransformer({ type: 'TEST1' })).toBe(mockTransformer1);
      expect(registry.createTransformer({ type: 'TEST2' })).toBe(mockTransformer2);
      expect(registry.createWriter({ type: 'TEST1' })).toBe(mockWriter1);
      expect(registry.createWriter({ type: 'TEST2' })).toBe(mockWriter2);
    });

    it('should maintain isolation between component types', () => {
      const mockComponent = { read: jest.fn(), transform: jest.fn(), write: jest.fn() };
      
      registry.registerReader('TEST', () => mockComponent);
      registry.registerTransformer('TEST', () => mockComponent);
      registry.registerWriter('TEST', () => mockComponent);

      expect(registry.readers['TEST']).toBeDefined();
      expect(registry.transformers['TEST']).toBeDefined();
      expect(registry.writers['TEST']).toBeDefined();
      
      expect(Object.keys(registry.readers)).toHaveLength(1);
      expect(Object.keys(registry.transformers)).toHaveLength(1);
      expect(Object.keys(registry.writers)).toHaveLength(1);
    });
  });
}); 