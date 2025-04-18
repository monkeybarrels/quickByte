import { FileReader } from '../../readers/file-reader';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs/promises
jest.mock('fs/promises');

test('FileReader exists', () => {
  expect(FileReader).toBeDefined();
});

describe('FileReader', () => {
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const reader = new FileReader({ path: 'test.txt' });
      
      expect(reader).toBeInstanceOf(FileReader);
    });

    it('should initialize with custom encoding', () => {
      const reader = new FileReader({ 
        path: 'test.txt',
        encoding: 'ascii'
      });
      
      expect(reader).toBeInstanceOf(FileReader);
    });

    it('should initialize with parseJson enabled', () => {
      const reader = new FileReader({ 
        path: 'test.json',
        parseJson: true
      });
      
      expect(reader).toBeInstanceOf(FileReader);
    });
  });

  describe('read', () => {
    it('should read file content as text', async () => {
      const testContent = 'Hello, World!';
      mockReadFile.mockResolvedValue(testContent);

      const reader = new FileReader({ path: 'test.txt' });
      const content = await reader.read();

      expect(content).toBe(testContent);
      expect(mockReadFile).toHaveBeenCalledWith(
        path.resolve('test.txt'),
        { encoding: 'utf-8' }
      );
    });

    it('should read and parse JSON content', async () => {
      const testContent = '{"key": "value"}';
      mockReadFile.mockResolvedValue(testContent);

      const reader = new FileReader({ 
        path: 'test.json',
        parseJson: true
      });
      const content = await reader.read();

      expect(content).toEqual({ key: 'value' });
      expect(mockReadFile).toHaveBeenCalledWith(
        path.resolve('test.json'),
        { encoding: 'utf-8' }
      );
    });

    it('should use custom encoding when specified', async () => {
      const testContent = 'Hello, World!';
      mockReadFile.mockResolvedValue(testContent);

      const reader = new FileReader({ 
        path: 'test.txt',
        encoding: 'ascii'
      });
      await reader.read();

      expect(mockReadFile).toHaveBeenCalledWith(
        path.resolve('test.txt'),
        { encoding: 'ascii' }
      );
    });

    it('should throw error when file read fails', async () => {
      const error = new Error('File not found');
      mockReadFile.mockRejectedValue(error);

      const reader = new FileReader({ path: 'nonexistent.txt' });
      
      await expect(reader.read()).rejects.toThrow('Failed to read file nonexistent.txt: File not found');
    });

    it('should throw error when JSON parsing fails', async () => {
      const invalidJson = 'invalid json';
      mockReadFile.mockResolvedValue(invalidJson);

      const reader = new FileReader({ 
        path: 'test.json',
        parseJson: true
      });
      
      await expect(reader.read()).rejects.toThrow();
    });
  });

  describe('connect and disconnect', () => {
    it('should not throw errors for connect and disconnect', async () => {
      const reader = new FileReader({ path: 'test.txt' });
      
      await expect(reader.connect()).resolves.not.toThrow();
      await expect(reader.disconnect()).resolves.not.toThrow();
    });
  });
}); 