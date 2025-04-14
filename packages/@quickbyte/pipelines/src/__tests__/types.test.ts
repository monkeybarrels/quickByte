import { Reader, Writer, Transformer, FlexiblePipelineConfig } from '../types';

describe('Types', () => {
  describe('Reader Interface', () => {
    it('should implement basic Reader interface', async () => {
      const reader: Reader = {
        read: jest.fn().mockResolvedValue(['data'])
      };

      expect(reader.read).toBeDefined();
      const result = await reader.read();
      expect(result).toEqual(['data']);
    });

    it('should implement full Reader interface with optional methods', async () => {
      const reader: Reader = {
        read: jest.fn().mockResolvedValue(['data']),
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined)
      };

      expect(reader.read).toBeDefined();
      expect(reader.connect).toBeDefined();
      expect(reader.disconnect).toBeDefined();

      await reader.connect!();
      const result = await reader.read();
      await reader.disconnect!();

      expect(reader.connect).toHaveBeenCalled();
      expect(reader.read).toHaveBeenCalled();
      expect(reader.disconnect).toHaveBeenCalled();
      expect(result).toEqual(['data']);
    });

    it('should work with generic type parameter', async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const reader: Reader<TestData[]> = {
        read: jest.fn().mockResolvedValue([{ id: 1, name: 'test' }])
      };

      const result = await reader.read();
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('test');
    });
  });

  describe('Transformer Interface', () => {
    it('should implement basic Transformer interface', async () => {
      const transformer: Transformer = {
        transform: jest.fn().mockResolvedValue(['transformed'])
      };

      expect(transformer.transform).toBeDefined();
      const result = await transformer.transform(['data']);
      expect(result).toEqual(['transformed']);
    });

    it('should work with generic type parameters', async () => {
      interface Input {
        id: number;
        name: string;
      }

      interface Output {
        userId: string;
        fullName: string;
      }

      const transformer: Transformer<Input[], Output[]> = {
        transform: jest.fn().mockResolvedValue([
          { userId: '1', fullName: 'Test User' }
        ])
      };

      const result = await transformer.transform([
        { id: 1, name: 'Test' }
      ]);

      expect(result[0].userId).toBe('1');
      expect(result[0].fullName).toBe('Test User');
    });
  });

  describe('Writer Interface', () => {
    it('should implement basic Writer interface', async () => {
      const writer: Writer = {
        write: jest.fn().mockResolvedValue(undefined)
      };

      expect(writer.write).toBeDefined();
      await writer.write(['data']);
      expect(writer.write).toHaveBeenCalledWith(['data']);
    });

    it('should implement full Writer interface with optional methods', async () => {
      const writer: Writer = {
        write: jest.fn().mockResolvedValue(undefined),
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined)
      };

      expect(writer.write).toBeDefined();
      expect(writer.connect).toBeDefined();
      expect(writer.disconnect).toBeDefined();

      await writer.connect!();
      await writer.write(['data']);
      await writer.disconnect!();

      expect(writer.connect).toHaveBeenCalled();
      expect(writer.write).toHaveBeenCalledWith(['data']);
      expect(writer.disconnect).toHaveBeenCalled();
    });

    it('should work with generic type parameter', async () => {
      interface TestData {
        id: number;
        value: string;
      }

      const writer: Writer<TestData[]> = {
        write: jest.fn().mockResolvedValue(undefined)
      };

      const testData = [{ id: 1, value: 'test' }];
      await writer.write(testData);
      expect(writer.write).toHaveBeenCalledWith(testData);
    });
  });

  describe('FlexiblePipelineConfig Interface', () => {
    it('should create valid pipeline config with required fields', () => {
      const reader: Reader = { read: jest.fn() };
      const writer: Writer = { write: jest.fn() };

      const config: FlexiblePipelineConfig = {
        reader,
        writer
      };

      expect(config.reader).toBe(reader);
      expect(config.writer).toBe(writer);
      expect(config.transformers).toBeUndefined();
    });

    it('should create valid pipeline config with optional transformers', () => {
      const reader: Reader = { read: jest.fn() };
      const transformer: Transformer = { transform: jest.fn() };
      const writer: Writer = { write: jest.fn() };

      const config: FlexiblePipelineConfig = {
        reader,
        transformers: [transformer],
        writer
      };

      expect(config.reader).toBe(reader);
      expect(config.transformers).toHaveLength(1);
      expect(config.transformers![0]).toBe(transformer);
      expect(config.writer).toBe(writer);
    });

    it('should create valid pipeline config with multiple transformers', () => {
      const reader: Reader = { read: jest.fn() };
      const transformer1: Transformer = { transform: jest.fn() };
      const transformer2: Transformer = { transform: jest.fn() };
      const writer: Writer = { write: jest.fn() };

      const config: FlexiblePipelineConfig = {
        reader,
        transformers: [transformer1, transformer2],
        writer
      };

      expect(config.reader).toBe(reader);
      expect(config.transformers).toHaveLength(2);
      expect(config.transformers![0]).toBe(transformer1);
      expect(config.transformers![1]).toBe(transformer2);
      expect(config.writer).toBe(writer);
    });
  });
}); 