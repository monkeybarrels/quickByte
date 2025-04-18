import * as fs from 'fs';
import { FlexiblePipeline } from '../pipeline';
import { PipelineConfig } from '../types';
import { createPipeline } from './json-pipeline';

/**
 * Creates a FlexiblePipeline instance from a configuration file.
 * 
 * @param configPath - The path to the JSON configuration file that defines the pipeline structure
 * @returns A Promise that resolves to a FlexiblePipeline instance configured according to the provided config file
 * @throws {Error} If the config file cannot be read or parsed, or if the pipeline creation fails
 * 
 * @example
 * ```typescript
 * const pipeline = await createPipelineFromConfig('./config/pipeline.json');
 * ```
 */
export async function createPipelineFromConfig(configPath: string): Promise<FlexiblePipeline> {
  // Read and parse the config file
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config: PipelineConfig = JSON.parse(configContent);

  return createPipeline(config);
};