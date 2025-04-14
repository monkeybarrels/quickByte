import { FlexiblePipelineConfig, Reader, Transformer, Writer } from './types';

/**
 * FlexiblePipeline - A more flexible implementation of the data pipeline
 * that allows for more loosely coupled components and easier composition.
 */
export class FlexiblePipeline {
  private config: FlexiblePipelineConfig;
  private reader: Reader;
  private writer: Writer;
  private transformers: Transformer[] = [];

  constructor(config: FlexiblePipelineConfig) {
    this.config = config;
    this.reader = config.reader;
    this.writer = config.writer;
    
    if (config.transformers) {
      this.transformers = config.transformers;
    }
  }

  /**
   * Run the pipeline
   */
  async run(): Promise<void> {
    try {
      // Connect to reader and writer if they have connect methods
      if (this.reader.connect) {
        await this.reader.connect();
      }
      
      if (this.writer.connect) {
        await this.writer.connect();
      }
      
      // Read data from source
      let data = await this.reader.read();
      
      // Apply each transformer in sequence
      for (const transformer of this.transformers) {
        data = await transformer.transform(data);
      }
      
      // Write transformed data
      await this.writer.write(data);
      
      console.log('Pipeline completed successfully');
    } catch (error) {
      console.error('Pipeline execution failed:', error);
      throw error;
    } finally {
      // Always disconnect from reader and writer if they have disconnect methods
      try {
        if (this.reader.disconnect) {
          await this.reader.disconnect();
        }
        
        if (this.writer.disconnect) {
          await this.writer.disconnect();
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  }
} 