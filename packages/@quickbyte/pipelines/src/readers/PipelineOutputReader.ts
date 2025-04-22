import { Reader } from '../types';
import { PipelineOutputReaderSchema } from './schema';
import { FileReader } from './file-reader';
import { MongoReader } from './MongoReader';
import { MemoryReader } from './MemoryReader';
import { ApiReader } from './ApiReader';
import { CsvReader } from './CsvReader';

/**
 * A reader implementation that reads data from the output of another pipeline.
 * This reader is useful for chaining pipelines together.
 */
export class PipelineOutputReader implements Reader {
  private pipelineId: string;
  private outputPath?: string;

  /**
   * Creates a new PipelineOutputReader instance.
   * @param config - Configuration object for the reader
   * @param config.options - Configuration options
   * @param config.options.pipelineId - The ID of the pipeline whose output to read
   * @param config.options.outputPath - Optional path to the specific output file if the pipeline writes to multiple files
   */
  constructor(config: any) {
    const validatedConfig = PipelineOutputReaderSchema.parse(config.options);
    this.pipelineId = validatedConfig.pipelineId;
    this.outputPath = validatedConfig.outputPath;
  }

  /**
   * Reads the data from the specified pipeline's output.
   * This implementation:
   * 1. Determines the output type and location
   * 2. Creates an appropriate reader based on the output type
   * 3. Reads and returns the data
   * 
   * @returns A promise that resolves to the pipeline's output data
   */
  async read(): Promise<any> {
    if (!this.outputPath) {
      throw new Error('outputPath is required to read pipeline output');
    }

    // Determine the output type based on the file extension or format
    const outputType = this.determineOutputType(this.outputPath);

    // Create an appropriate reader based on the output type
    const reader = this.createReaderForType(outputType);

    // Read and return the data
    return reader.read();
  }

  /**
   * Determines the output type based on the file extension or format
   * @param path - The output path
   * @returns The determined output type
   */
  private determineOutputType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return 'CSV';
      case 'json':
        return 'FILE';
      case 'txt':
        return 'FILE';
      default:
        // If no extension matches, try to determine from the path pattern
        if (path.startsWith('mongodb://')) {
          return 'MONGO';
        } else if (path.startsWith('http://') || path.startsWith('https://')) {
          return 'API';
        } else if (path.startsWith('memory://')) {
          return 'MEMORY';
        } else {
          return 'FILE';
        }
    }
  }

  /**
   * Creates an appropriate reader based on the output type
   * @param type - The output type
   * @returns A reader instance configured to read the output
   */
  private createReaderForType(type: string): Reader {
    const config = {
      type,
      location: this.outputPath,
      options: {}
    };

    switch (type) {
      case 'CSV':
        return new CsvReader(config);
      case 'FILE':
        return new FileReader({
          path: this.outputPath!,
          encoding: 'utf-8',
          parseJson: true
        });
      case 'MONGO':
        return new MongoReader(config);
      case 'API':
        return new ApiReader(config);
      case 'MEMORY':
        return new MemoryReader(config);
      default:
        throw new Error(`Unsupported output type: ${type}`);
    }
  }
} 