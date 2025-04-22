import '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { scaffold } from '../index';
import { ScaffoldType } from '../types';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('scaffold function', () => {
  const testOutPath = '/test/path';
  const testName = 'testComponent';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock mkdirSync to do nothing
    mockedFs.mkdirSync.mockImplementation(() => undefined);
    // Mock writeFileSync to do nothing
    mockedFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('should throw error for unsupported type', () => {
    const unsupportedType = 'unsupported' as ScaffoldType;
    expect(() => scaffold(unsupportedType, testName, testOutPath))
      .toThrow(`Unsupported type: ${unsupportedType}`);
  });

  it('should call the correct scaffold component for each type', () => {
    const types: ScaffoldType[] = ['reader', 'transformer', 'writer'];
    
    types.forEach(type => {
      scaffold(type, testName, testOutPath);
      const expectedFolder = path.join(testOutPath, testName);
      
      // Verify directory creation
      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expectedFolder, { recursive: true });
      
      // Verify file creation
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.join(expectedFolder, `${testName}.ts`),
        expect.any(String)
      );
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.join(expectedFolder, 'schemas.ts'),
        expect.any(String)
      );
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        path.join(expectedFolder, 'index.ts'),
        expect.any(String)
      );
    });
  });
}); 