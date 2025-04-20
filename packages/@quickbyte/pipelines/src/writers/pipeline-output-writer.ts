import { Writer, WriterConfig, CsvWriterConfig } from '../types';
import { PipelineOutputWriterSchema } from './schema';
import { z } from 'zod';
import { defaultRegistry } from '../registry';
import { MongoWriter } from './mongo-writer';
import { ApiWriter } from './api-writer';
import { CsvWriter } from './csv-writer';
import { MemoryWriter } from './memory-writer';

/**
 * A writer implementation that writes data to be consumed by another pipeline.
 * This writer is useful for chaining pipelines together.
 */
export class PipelineOutputWriter implements Writer {
  private pipelineId: string;
  private outputPath?: string;

  /**
   * Creates a new PipelineOutputWriter instance.
   * @param config - Configuration object for the writer
   * @param config.options - Configuration options
   * @param config.options.pipelineId - The ID of the pipeline that will consume this output
   * @param config.options.outputPath - Optional path to write the output to
   */
  constructor(config: any) {
    const validatedConfig = PipelineOutputWriterSchema.parse(config.options);
    this.pipelineId = validatedConfig.pipelineId;
    this.outputPath = validatedConfig.outputPath;
  }

  /**
   * Writes the data to the specified location.
   * This implementation:
   * 1. Determines the output type and location
   * 2. Creates an appropriate writer based on the output type
   * 3. Writes the data
   * 
   * @param data - The data to write
   */
  async write(data: any[]): Promise<void> {
    if (!this.outputPath) {
      throw new Error('outputPath is required to write pipeline output');
    }

    // Determine the output type based on the file extension or format
    const outputType = this.determineOutputType(this.outputPath);

    // Create an appropriate writer based on the output type
    const writer = this.createWriterForType(outputType);

    // Write the data
    await writer.write(data);
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
        return 'API';  // Use API writer for JSON files
      case 'txt':
        return 'API';  // Use API writer for text files
      default:
        // If no extension matches, try to determine from the path pattern
        if (path.startsWith('mongodb://')) {
          return 'MONGO';
        } else if (path.startsWith('http://') || path.startsWith('https://')) {
          return 'API';
        } else if (path.startsWith('memory://')) {
          return 'MEMORY';
        } else {
          return 'API';  // Default to API writer for unknown types
        }
    }
  }

  /**
   * Creates an appropriate writer based on the output type
   * @param type - The output type
   * @returns A writer instance configured to write the output
   */
  private createWriterForType(type: string): Writer {
    switch (type) {
      case 'CSV':
        const csvConfig: CsvWriterConfig = {
          location: this.outputPath!,
          options: {
            headers: true
          }
        };
        return new CsvWriter(csvConfig);
      case 'MONGO':
        const mongoConfig: WriterConfig = {
          type: 'MONGO',
          location: this.outputPath!,
          options: {}
        };
        return new MongoWriter(mongoConfig);
      case 'API':
        const apiConfig: WriterConfig = {
          type: 'API',
          location: this.outputPath!,
          options: {}
        };
        return new ApiWriter(apiConfig);
      case 'MEMORY':
        return new MemoryWriter();
      default:
        throw new Error(`Unsupported output type: ${type}`);
    }
  }
} 