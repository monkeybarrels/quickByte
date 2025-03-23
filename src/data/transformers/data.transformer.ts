import { DataReader, DataFormatter, DataWriter, SourceConfig, FormatConfig, WriterConfig, TransformerType } from '../types';
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
        const transformer = {
            type: TransformerType.COMPLEX,
            name: 'dataTransformer',
            description: 'Transforms data from source to target format',
            transform: config.transform,
            transformBatch: (items: T[]): R[] => items.map(config.transform)
        };
        this.pipeline = createTransformerPipeline<T, R>([transformer]);
    }

    async transform(): Promise<void> {
        try {
            const data = await this.config.reader.read(this.config.sourceConfig);
            const transformedData = this.pipeline.transformBatch(data);

            let output: string | R[] = transformedData;
            if (this.config.formatter && this.config.formatterConfig) {
                output = await this.config.formatter.format(transformedData, this.config.formatterConfig) as string | R[];
            }

            const dataToWrite = typeof output === 'string' ? [output] : output;
            await this.config.writer.write(dataToWrite as R[], this.config.writerConfig);
        } catch (error) {
            console.error('Error during transformation:', error);
            throw error;
        }
    }
}

export function createDataTransformer<T, R>(config: TransformConfig<T, R>): DataTransformer<T, R> {
    return new DataTransformer<T, R>(config);
} 