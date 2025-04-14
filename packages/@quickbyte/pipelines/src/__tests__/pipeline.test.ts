import { FlexiblePipeline } from '../pipeline';
import { Reader, Writer, Transformer } from '../types';

describe('FlexiblePipeline', () => {
  // Mock components
  let mockReader: Reader;
  let mockWriter: Writer;
  let mockTransformer: Transformer;

  beforeEach(() => {
    // Setup mock reader
    mockReader = {
      read: jest.fn().mockResolvedValue(['data1', 'data2']),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    };

    // Setup mock writer
    mockWriter = {
      write: jest.fn().mockResolvedValue(undefined),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    };

    // Setup mock transformer
    mockTransformer = {
      transform: jest.fn().mockImplementation((data: string[]) => 
        data.map((item: string) => `transformed_${item}`)
      )
    };

    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required components', () => {
      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        writer: mockWriter
      });

      expect(pipeline).toBeInstanceOf(FlexiblePipeline);
    });

    it('should initialize with optional transformers', () => {
      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        writer: mockWriter,
        transformers: [mockTransformer]
      });

      expect(pipeline).toBeInstanceOf(FlexiblePipeline);
    });
  });

  describe('run', () => {
    it('should execute pipeline with basic reader and writer', async () => {
      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        writer: mockWriter
      });

      await pipeline.run();

      expect(mockReader.read).toHaveBeenCalled();
      expect(mockWriter.write).toHaveBeenCalledWith(['data1', 'data2']);
      expect(console.log).toHaveBeenCalledWith('Pipeline completed successfully');
    });

    it('should execute pipeline with transformers', async () => {
      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        transformers: [mockTransformer],
        writer: mockWriter
      });

      await pipeline.run();

      expect(mockReader.read).toHaveBeenCalled();
      expect(mockTransformer.transform).toHaveBeenCalledWith(['data1', 'data2']);
      expect(mockWriter.write).toHaveBeenCalledWith(['transformed_data1', 'transformed_data2']);
    });

    it('should execute pipeline with multiple transformers in sequence', async () => {
      const secondTransformer: Transformer = {
        transform: jest.fn().mockImplementation((data: string[]) => 
          data.map((item: string) => `${item}_again`)
        )
      };

      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        transformers: [mockTransformer, secondTransformer],
        writer: mockWriter
      });

      await pipeline.run();

      expect(mockReader.read).toHaveBeenCalled();
      expect(mockTransformer.transform).toHaveBeenCalledWith(['data1', 'data2']);
      expect(secondTransformer.transform).toHaveBeenCalledWith(['transformed_data1', 'transformed_data2']);
      expect(mockWriter.write).toHaveBeenCalledWith(['transformed_data1_again', 'transformed_data2_again']);
    });

    it('should connect and disconnect components if methods are available', async () => {
      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        writer: mockWriter
      });

      await pipeline.run();

      expect(mockReader.connect).toHaveBeenCalled();
      expect(mockWriter.connect).toHaveBeenCalled();
      expect(mockReader.disconnect).toHaveBeenCalled();
      expect(mockWriter.disconnect).toHaveBeenCalled();
    });

    it('should handle components without connect/disconnect methods', async () => {
      const simpleReader: Reader = {
        read: jest.fn().mockResolvedValue(['data'])
      };

      const simpleWriter: Writer = {
        write: jest.fn().mockResolvedValue(undefined)
      };

      const pipeline = new FlexiblePipeline({
        reader: simpleReader,
        writer: simpleWriter
      });

      await pipeline.run();

      expect(simpleReader.read).toHaveBeenCalled();
      expect(simpleWriter.write).toHaveBeenCalledWith(['data']);
    });

    it('should handle reader errors', async () => {
      const errorReader: Reader = {
        read: jest.fn().mockRejectedValue(new Error('Read error'))
      };

      const pipeline = new FlexiblePipeline({
        reader: errorReader,
        writer: mockWriter
      });

      await expect(pipeline.run()).rejects.toThrow('Read error');
      expect(console.error).toHaveBeenCalledWith('Pipeline execution failed:', expect.any(Error));
    });

    it('should handle transformer errors', async () => {
      const errorTransformer: Transformer = {
        transform: jest.fn().mockRejectedValue(new Error('Transform error'))
      };

      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        transformers: [errorTransformer],
        writer: mockWriter
      });

      await expect(pipeline.run()).rejects.toThrow('Transform error');
      expect(console.error).toHaveBeenCalledWith('Pipeline execution failed:', expect.any(Error));
    });

    it('should handle writer errors', async () => {
      const errorWriter: Writer = {
        write: jest.fn().mockRejectedValue(new Error('Write error'))
      };

      const pipeline = new FlexiblePipeline({
        reader: mockReader,
        writer: errorWriter
      });

      await expect(pipeline.run()).rejects.toThrow('Write error');
      expect(console.error).toHaveBeenCalledWith('Pipeline execution failed:', expect.any(Error));
    });

    it('should handle disconnect errors', async () => {
      const errorDisconnectReader: Reader = {
        read: jest.fn().mockResolvedValue(['data']),
        disconnect: jest.fn().mockRejectedValue(new Error('Disconnect error'))
      };

      const pipeline = new FlexiblePipeline({
        reader: errorDisconnectReader,
        writer: mockWriter
      });

      await pipeline.run();

      expect(errorDisconnectReader.read).toHaveBeenCalled();
      expect(mockWriter.write).toHaveBeenCalledWith(['data']);
      expect(console.error).toHaveBeenCalledWith('Error disconnecting:', expect.any(Error));
    });

    it('should still disconnect writer if reader fails', async () => {
      const errorReader: Reader = {
        read: jest.fn().mockRejectedValue(new Error('Read error')),
        disconnect: jest.fn().mockResolvedValue(undefined)
      };

      const pipeline = new FlexiblePipeline({
        reader: errorReader,
        writer: mockWriter
      });

      await expect(pipeline.run()).rejects.toThrow('Read error');
      expect(errorReader.disconnect).toHaveBeenCalled();
      expect(mockWriter.disconnect).toHaveBeenCalled();
    });
  });
}); 