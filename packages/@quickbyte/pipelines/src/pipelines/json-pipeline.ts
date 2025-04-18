/**
 * @fileoverview This module provides functionality for creating and managing JSON pipelines.
 * It handles the creation of pipeline components including readers, transformers, and writers.
 */

import { FlexiblePipeline } from '../pipeline';
import { defaultRegistry, Registry } from '../registry';
import { registerDefaultComponents } from '../factory';
import { PipelineConfig } from '../types';
import * as fs from 'fs';

/**
 * Creates a new pipeline instance with the specified configuration.
 * 
 * @async
 * @function createPipeline
 * @param {PipelineConfig} config - The configuration object for the pipeline
 * @param {Object} config.reader - Configuration for the pipeline reader
 * @param {Array<Object>} config.transformers - Array of configurations for pipeline transformers
 * @param {Object} config.writer - Configuration for the pipeline writer
 * @returns {Promise<FlexiblePipeline>} A promise that resolves to a new pipeline instance
 * 
 * @example
 * const pipeline = await createPipeline({
 *   reader: { type: 'file', path: 'input.json' },
 *   transformers: [{ type: 'filter', condition: 'value > 10' }],
 *   writer: { type: 'file', path: 'output.json' }
 * });
 */
const createPipeline = async (config: PipelineConfig): Promise<FlexiblePipeline> => {
  // Register all available components
  registerDefaultComponents();

  // Create the reader
  const reader = defaultRegistry.createReader(config.reader);

  // Create all transformers
  const transformers = config.transformers.map(transformerConfig => 
    defaultRegistry.createTransformer(transformerConfig)
  );

  // Create the writer
  const writer = defaultRegistry.createWriter(config.writer);

  // Create and return the pipeline
  return new FlexiblePipeline({
    reader,
    transformers,
    writer
  });
};

export { createPipeline };