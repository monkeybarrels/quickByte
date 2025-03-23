import { DataTransformer, TransformerType } from '../types';

/**
 * A pipeline that chains multiple transformers together
 */
export class TransformerPipeline<T, R> implements DataTransformer<T, R> {
    private transformers: DataTransformer<any, any>[];
    type: TransformerType = TransformerType.BATCH;

    constructor(transformers: DataTransformer<any, any>[]) {
        if (!transformers) {
            throw new Error('Transformers array cannot be null or undefined');
        }
        this.transformers = transformers;
    }

    transform(data: T): R {
        let currentData: any = data;
        
        for (const transformer of this.transformers) {
            currentData = transformer.transform(currentData);
        }

        return currentData as R;
    }

    transformBatch(data: T[]): R[] {
        if (!data.length) {
            return [];
        }
        let currentData: any[] = data;
        
        for (const transformer of this.transformers) {
            if (transformer.transformBatch) {
                currentData = transformer.transformBatch(currentData);
            } else {
                currentData = currentData.map(item => transformer.transform(item));
            }
        }

        return currentData as R[];
    }
}

/**
 * Creates a new transformer pipeline
 * @param transformers - Array of transformers to chain together
 * @returns A new transformer pipeline
 */
export function createTransformerPipeline<T, R>(
    transformers: DataTransformer<any, any>[]
): TransformerPipeline<T, R> {
    return new TransformerPipeline<T, R>(transformers);
} 