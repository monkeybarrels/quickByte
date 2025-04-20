import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PipelineOutputWriter } from '../pipeline-output-writer';
import { MongoWriter } from '../mongo-writer';
import { ApiWriter } from '../api-writer';
import { CsvWriter } from '../csv-writer';
import { MemoryWriter } from '../memory-writer';

// Mock the writer classes
jest.mock('../mongo-writer');
jest.mock('../api-writer');
jest.mock('../csv-writer');
jest.mock('../memory-writer');

describe('PipelineOutputWriter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if pipelineId is missing', () => {
      expect(() => {
        new PipelineOutputWriter({ options: {} });
      }).toThrow();
    });

    it('should initialize with valid config', () => {
      const config = {
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'test.csv'
        }
      };
      const writer = new PipelineOutputWriter(config);
      expect(writer).toBeDefined();
    });
  });

  describe('write', () => {
    it('should throw error if outputPath is not provided', async () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline'
        }
      });
      await expect(writer.write([])).rejects.toThrow('outputPath is required');
    });

    it('should write data using CSV writer for .csv files', async () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'test.csv'
        }
      });
      const testData = [{ id: 1, name: 'test' }];
      await writer.write(testData);
      expect(CsvWriter).toHaveBeenCalledWith(expect.objectContaining({
        location: 'test.csv',
        options: { headers: true }
      }));
    });

    it('should write data using Mongo writer for MongoDB URLs', async () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'mongodb://localhost:27017/test'
        }
      });
      const testData = [{ id: 1, name: 'test' }];
      await writer.write(testData);
      expect(MongoWriter).toHaveBeenCalledWith(expect.objectContaining({
        type: 'MONGO',
        location: 'mongodb://localhost:27017/test'
      }));
    });

    it('should write data using API writer for HTTP URLs', async () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'https://api.example.com/data'
        }
      });
      const testData = [{ id: 1, name: 'test' }];
      await writer.write(testData);
      expect(ApiWriter).toHaveBeenCalledWith(expect.objectContaining({
        type: 'API',
        location: 'https://api.example.com/data'
      }));
    });

    it('should write data using Memory writer for memory:// paths', async () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'memory://test'
        }
      });
      const testData = [{ id: 1, name: 'test' }];
      await writer.write(testData);
      expect(MemoryWriter).toHaveBeenCalled();
    });
  });

  describe('determineOutputType', () => {
    it('should determine CSV type for .csv files', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'test.csv'
        }
      });
      const type = (writer as any).determineOutputType('test.csv');
      expect(type).toBe('CSV');
    });

    it('should determine API type for .json files', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'test.json'
        }
      });
      const type = (writer as any).determineOutputType('test.json');
      expect(type).toBe('API');
    });

    it('should determine MONGO type for MongoDB URLs', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'mongodb://localhost:27017/test'
        }
      });
      const type = (writer as any).determineOutputType('mongodb://localhost:27017/test');
      expect(type).toBe('MONGO');
    });

    it('should determine API type for HTTP URLs', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'https://api.example.com/data'
        }
      });
      const type = (writer as any).determineOutputType('https://api.example.com/data');
      expect(type).toBe('API');
    });

    it('should determine MEMORY type for memory:// paths', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'memory://test'
        }
      });
      const type = (writer as any).determineOutputType('memory://test');
      expect(type).toBe('MEMORY');
    });

    it('should default to API type for unknown file types', () => {
      const writer = new PipelineOutputWriter({
        options: {
          pipelineId: 'test-pipeline',
          outputPath: 'test.unknown'
        }
      });
      const type = (writer as any).determineOutputType('test.unknown');
      expect(type).toBe('API');
    });
  });
}); 