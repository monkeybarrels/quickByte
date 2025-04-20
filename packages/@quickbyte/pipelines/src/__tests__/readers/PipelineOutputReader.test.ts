import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PipelineOutputReader } from '../../readers/PipelineOutputReader';
import { FileReader } from '../../readers/file-reader';
import { MongoReader } from '../../readers/MongoReader';
import { ApiReader } from '../../readers/ApiReader';
import { CsvReader } from '../../readers/CsvReader';
import { MemoryReader } from '../../readers/MemoryReader';

// Mock the dependent readers
jest.mock('../../readers/file-reader');
jest.mock('../../readers/MongoReader');
jest.mock('../../readers/ApiReader');
jest.mock('../../readers/CsvReader');
jest.mock('../../readers/MemoryReader');

describe('PipelineOutputReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if pipelineId is missing', () => {
      expect(() => new PipelineOutputReader({ options: {} })).toThrow();
    });

    it('should initialize with valid config', () => {
      const config = {
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'output.json'
        }
      };
      const reader = new PipelineOutputReader(config);
      expect(reader).toBeInstanceOf(PipelineOutputReader);
    });
  });

  describe('read', () => {
    it('should throw error if outputPath is missing', async () => {
      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline'
        }
      });
      await expect(reader.read()).rejects.toThrow('outputPath is required');
    });

    it('should use FileReader for JSON files', async () => {
      const mockData = { test: 'data' };
      const mockRead = jest.fn<() => Promise<any>>().mockResolvedValue(mockData);
      (FileReader.prototype.read as jest.Mock).mockImplementation(mockRead);

      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'output.json'
        }
      });

      const result = await reader.read();
      expect(FileReader).toHaveBeenCalledWith({
        path: 'output.json',
        encoding: 'utf-8',
        parseJson: true
      });
      expect(result).toEqual(mockData);
    });

    it('should use CsvReader for CSV files', async () => {
      const mockData = [{ column1: 'value1' }];
      const mockRead = jest.fn<() => Promise<any>>().mockResolvedValue(mockData);
      (CsvReader.prototype.read as jest.Mock).mockImplementation(mockRead);

      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'output.csv'
        }
      });

      const result = await reader.read();
      expect(CsvReader).toHaveBeenCalledWith({
        type: 'CSV',
        location: 'output.csv',
        options: {}
      });
      expect(result).toEqual(mockData);
    });

    it('should use MongoReader for MongoDB URLs', async () => {
      const mockData = [{ _id: '123', data: 'test' }];
      const mockRead = jest.fn<() => Promise<any>>().mockResolvedValue(mockData);
      (MongoReader.prototype.read as jest.Mock).mockImplementation(mockRead);

      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'mongodb://localhost:27017/test'
        }
      });

      const result = await reader.read();
      expect(MongoReader).toHaveBeenCalledWith({
        type: 'MONGO',
        location: 'mongodb://localhost:27017/test',
        options: {}
      });
      expect(result).toEqual(mockData);
    });

    it('should use ApiReader for HTTP URLs', async () => {
      const mockData = { status: 'success', data: 'test' };
      const mockRead = jest.fn<() => Promise<any>>().mockResolvedValue(mockData);
      (ApiReader.prototype.read as jest.Mock).mockImplementation(mockRead);

      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'https://api.example.com/data'
        }
      });

      const result = await reader.read();
      expect(ApiReader).toHaveBeenCalledWith({
        type: 'API',
        location: 'https://api.example.com/data',
        options: {}
      });
      expect(result).toEqual(mockData);
    });

    it('should use MemoryReader for memory type', async () => {
      const mockData = { test: 'data' };
      const mockRead = jest.fn<() => Promise<any>>().mockResolvedValue(mockData);
      (MemoryReader.prototype.read as jest.Mock).mockImplementation(mockRead);

      const reader = new PipelineOutputReader({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'memory://test'
        }
      });

      const result = await reader.read();
      expect(MemoryReader).toHaveBeenCalledWith({
        type: 'MEMORY',
        location: 'memory://test',
        options: {}
      });
      expect(result).toEqual(mockData);
    });
  });
}); 