import { Command } from 'commander';
import { readFileSync } from 'fs';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { createJsonPipeline, defaultRegistry, ReaderSchemas, WriterSchemas, TransformerSchemas } from '@quickbyte/pipelines';
import * as fs from 'fs';


function validatePipelineConfig(config: any): void {
  const { reader, writer, transformers = [] } = config;

  // Reader
  const readerSchema = ReaderSchemas[reader?.type as keyof typeof ReaderSchemas];
  if (!readerSchema) throw new Error(`Unknown reader type: ${reader?.type}`);
  readerSchema.parse(reader.config ?? {});

  // Writer
  const writerSchema = WriterSchemas[writer?.type as keyof typeof WriterSchemas];
  if (!writerSchema) throw new Error(`Unknown writer type: ${writer?.type}`);
  writerSchema.parse(writer.config ?? {});

  // Transformers
  for (const transformer of transformers) {
    const transformerSchema = TransformerSchemas[transformer?.type as keyof typeof TransformerSchemas];
    if (!transformerSchema) throw new Error(`Unknown transformer type: ${transformer?.type}`);
    transformerSchema.parse(transformer.config ?? {});
  }
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});

async function runPipeline(configPath: string) {
  try {
    logger.info(`Loading pipeline config from ${configPath}`);
    const configContent = readFileSync(path.resolve(configPath), 'utf-8');
    const config = JSON.parse(configContent);

    logger.info('Creating pipeline...');
    const pipeline = await createJsonPipeline(config);

    logger.info('Running pipeline...');
    await pipeline.run();

    logger.info('Pipeline completed successfully');
  } catch (error) {
    logger.error('Pipeline failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const program = new Command();

program
  .name('quickbyte')
  .description('CLI tool for running QuickByte data pipelines')
  .version('0.1.0');

program
  .command('run')
  .description('Run a pipeline from a config file')
  .argument('<configPath>', 'Path to the pipeline config file')
  .action(runPipeline);

program
  .command('validate')
  .description('Validate a pipeline config without executing it')
  .argument('<configPath>', 'Path to the pipeline config file')
  .action((configPath) => {
    try {
      const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf-8'));
      validatePipelineConfig(config);
      console.log('✅ Config is valid!');
    } catch (err) {
      console.error('❌ Config validation failed:');
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all registered component types')
  .action(() => {
    console.log('📥 Readers:', Object.keys(defaultRegistry.readers));
    console.log('🔄 Transformers:', Object.keys(defaultRegistry.transformers));
    console.log('📤 Writers:', Object.keys(defaultRegistry.writers));
  });

program.parse(); 