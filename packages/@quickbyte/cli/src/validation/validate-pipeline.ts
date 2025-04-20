import { ReaderSchemas, WriterSchemas, TransformerSchemas } from '@quickbyte/pipelines';

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

  export { validatePipelineConfig };