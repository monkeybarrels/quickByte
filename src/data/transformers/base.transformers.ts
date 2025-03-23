import { DataTransformer, TransformerConfig, FieldMappingConfig, FilterConfig, MapConfig, TransformerType } from '../types';

/**
 * Base transformer class that implements common functionality
 */
export abstract class BaseTransformer<T, R> implements DataTransformer<T, R> {
    protected config: TransformerConfig;
    type: TransformerType;

    constructor(config: TransformerConfig, type: TransformerType) {
        this.config = config;
        this.type = type;
    }

    abstract transform(data: T): R;

    transformBatch(data: T[]): R[] {
        return data.map(item => this.transform(item));
    }
}

/**
 * Transformer that maps fields from one object structure to another
 */
export class FieldMappingTransformer extends BaseTransformer<Record<string, unknown>, Record<string, unknown>> {
    private fieldMap: Record<string, string>;
    private dropUnmapped: boolean;

    constructor(config: FieldMappingConfig) {
        super(config, TransformerType.FIELD_MAPPING);
        this.fieldMap = config.fieldMap;
        this.dropUnmapped = config.dropUnmapped ?? false;
    }

    transform(data: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        
        for (const [sourceField, targetField] of Object.entries(this.fieldMap)) {
            if (sourceField in data) {
                result[targetField] = data[sourceField];
            }
        }

        if (!this.dropUnmapped) {
            // Copy unmapped fields
            for (const [key, value] of Object.entries(data)) {
                if (!(key in this.fieldMap)) {
                    result[key] = value;
                }
            }
        }

        return result;
    }
}

/**
 * Transformer that filters data based on a predicate function
 */
export class FilterTransformer<T> extends BaseTransformer<T, T> {
    private predicate: (item: T) => boolean;

    constructor(config: FilterConfig<T>) {
        super(config, TransformerType.FILTER);
        this.predicate = config.predicate;
    }

    transform(data: T): T {
        if (!this.predicate(data)) {
            throw new Error('Item does not match filter criteria');
        }
        return data;
    }

    transformBatch(data: T[]): T[] {
        return data.filter(this.predicate);
    }
}

/**
 * Transformer that applies a transformation function to each item
 */
export class MapTransformer<T, R> extends BaseTransformer<T, R> {
    private transformFn: (item: T) => R;

    constructor(config: MapConfig<T, R>) {
        super(config, TransformerType.MAP);
        this.transformFn = config.transform;
    }

    transform(data: T): R {
        return this.transformFn(data);
    }
}

/**
 * Creates a field mapping transformer
 */
export function createFieldMappingTransformer(config: FieldMappingConfig): FieldMappingTransformer {
    return new FieldMappingTransformer(config);
}

/**
 * Creates a filter transformer
 */
export function createFilterTransformer<T>(config: FilterConfig<T>): FilterTransformer<T> {
    return new FilterTransformer<T>(config);
}

/**
 * Creates a map transformer
 */
export function createMapTransformer<T, R>(config: MapConfig<T, R>): MapTransformer<T, R> {
    return new MapTransformer<T, R>(config);
} 