import { FlexiblePipelineConfig, Reader, Transformer, Writer } from './types';

/**
 * A flexible data pipeline that orchestrates the flow of data through a series of components.
 * The pipeline consists of a reader, optional transformers, and a writer.
 * 
 * @class FlexiblePipeline
 * @template T - The type of data flowing through the pipeline
 */
export class FlexiblePipeline<T = any> {
  private config: FlexiblePipelineConfig<T>;
  private reader: Reader<T>;
  private writer: Writer<T>;
  private transformers: Transformer<T>[] = [];

  /**
   * Creates a new FlexiblePipeline instance
   * @param {FlexiblePipelineConfig<T>} config - The pipeline configuration
   */
  constructor(config: FlexiblePipelineConfig<T>) {
    this.config = config;
    this.reader = config.reader;
    this.writer = config.writer;
    
    if (config.transformers) {
      this.transformers = config.transformers;
    }
  }

  /**
   * Adds a transformer to the pipeline
   * @param {Transformer<T>} transformer - The transformer to add
   */
  addTransformer(transformer: Transformer<T>): void {
    this.transformers.push(transformer);
  }

  /**
   * Updates the writer component of the pipeline
   * @param {Writer<T>} writer - The new writer to use
   */
  updateWriter(writer: Writer<T>): void {
    this.writer = writer;
  }

  /**
   * Updates the reader component of the pipeline
   * @param {Reader<T>} reader - The new reader to use
   */
  updateReader(reader: Reader<T>): void {
    this.reader = reader;
  }

  /**
   * Executes the pipeline by:
   * 1. Connecting to the reader and writer (if they support it)
   * 2. Reading data from the source
   * 3. Applying each transformer in sequence
   * 4. Writing the transformed data
   * 5. Disconnecting from the reader and writer (if they support it)
   * 
   * @returns {Promise<void>} A promise that resolves when the pipeline execution is complete
   * @throws {Error} If any step of the pipeline fails
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