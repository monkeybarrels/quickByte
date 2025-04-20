import '@jest/globals';
import fs from 'fs';
import path from 'path';
import { scaffold } from '../index';
import { ScaffoldType } from '../types';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('Transformer Scaffold', () => {
  const testOutPath = '/test/path';
  const testName = 'testComponent';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock mkdirSync to do nothing
    mockedFs.mkdirSync.mockImplementation(() => undefined);
    // Mock writeFileSync to do nothing
    mockedFs.writeFileSync.mockImplementation(() => undefined);
  });

  it('should create files with correct content', () => {
    const type: ScaffoldType = 'transformer';
    scaffold(type, testName, testOutPath);

    const expectedFolder = path.join(testOutPath, testName);
    const expectedClassFile = expect.stringContaining(`class ${testName} implements Transformer`);
    const expectedSchemaFile = expect.stringContaining('z.object');
    const expectedIndexFile = expect.stringContaining('registerTransformer');

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(expectedFolder, `${testName}.ts`),
      expectedClassFile
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(expectedFolder, 'schemas.ts'),
      expectedSchemaFile
    );
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join(expectedFolder, 'index.ts'),
      expectedIndexFile
    );
  });
}); 