import * as fs from 'fs';
import { FlexiblePipeline } from '../pipeline';
import { PipelineConfig } from '../types';
import { createPipeline } from './json-pipeline';

export async function createPipelineFromConfig(configPath: string): Promise<FlexiblePipeline> {
  // Read and parse the config file
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config: PipelineConfig = JSON.parse(configContent);

  return createPipeline(config);
};