import { DataReader, DataFormatter, DataWriter, SourceConfig, FormatConfig, WriterConfig } from '../types';
import { createTransformerPipeline } from './pipeline';
import { createMapTransformer } from './base.transformers';

export interface TransformConfig<T, R> {
    reader: DataReader<T>;
    writer: DataWriter<R>;
    formatter?: DataFormatter<R>;
    transform: (item: T) => R;
    sourceConfig: SourceConfig;
    writerConfig: WriterConfig;
    formatterConfig?: FormatConfig;
}

export class DataTransformer<T, R> {
    private pipeline: ReturnType<typeof createTransformerPipeline<T, R>>;

    constructor(private config: TransformConfig<T, R>) {
        const transformer = createMapTransformer<T, R>({
            name: 'dataTransformer',
            description: 'Transforms data from source to target format',
            transform: config.transform
        });
        this.pipeline = createTransformerPipeline<T, R>([transformer]);
    }

    async transform(): Promise<void> {
        try {
            // Read data
            console.log('Reading data...');
            const data = await this.config.reader.read(this.config.sourceConfig);
            console.log(`Read ${data.length} items`);

            // Transform data
            console.log('Transforming data...');
            const transformedData = this.pipeline.transformBatch(data);

            // Format if formatter is provided
            let output: string | R[] = transformedData;
            if (this.config.formatter && this.config.formatterConfig) {
                console.log('Formatting data...');
                output = await this.config.formatter.format(transformedData, this.config.formatterConfig) as string | R[];
            }

            // Write output
            console.log('Writing output...');
            const dataToWrite = typeof output === 'string' ? [output] : output;
            await this.config.writer.write(dataToWrite as R[], this.config.writerConfig);

            console.log('Transformation complete!');
        } catch (error) {
            console.error('Error during transformation:', error);
            throw error;
        }
    }
}

export function createDataTransformer<T, R>(config: TransformConfig<T, R>): DataTransformer<T, R> {
    return new DataTransformer<T, R>(config);
} 