import { DataTransformer, TransformerConfig, FieldMappingConfig, FilterConfig, MapConfig, TransformerType, FilterOperator, MapOperation } from '../types';
import { createFieldMappingTransformer, createFilterTransformer, createMapTransformer } from './base.transformers';

/**
 * Base interface for dynamic transformer configuration
 */
export interface DynamicTransformerConfig {
    type: TransformerType;
    name?: string;
    description?: string;
}

/**
 * Configuration for dynamic field mapping transformer
 */
export interface DynamicFieldMappingConfig extends DynamicTransformerConfig {
    type: TransformerType.FIELD_MAPPING;
    fieldMap: Record<string, string>;
    dropUnmapped?: boolean;
}

/**
 * Configuration for dynamic filter transformer
 */
export interface DynamicFilterConfig extends DynamicTransformerConfig {
    type: TransformerType.FILTER;
    field: string;
    operator: FilterOperator;
    value: string | number | boolean;
}

/**
 * Configuration for dynamic map transformer
 */
export interface DynamicMapConfig extends DynamicTransformerConfig {
    type: TransformerType.MAP;
    operations: Array<{
        field: string;
        operation: MapOperation;
    }>;
}

/**
 * Union type of all dynamic transformer configs
 */
export type DynamicTransformerConfigUnion = 
    | DynamicFieldMappingConfig 
    | DynamicFilterConfig 
    | DynamicMapConfig;

/**
 * Creates a transformer from a dynamic configuration
 * @param config The dynamic transformer configuration
 * @returns A new transformer instance
 */
export function createDynamicTransformer<T, R>(config: DynamicTransformerConfigUnion): DataTransformer<T, R> {
    switch (config.type) {
        case TransformerType.FIELD_MAPPING:
            return createFieldMappingTransformer({
                name: config.name,
                description: config.description,
                fieldMap: config.fieldMap,
                dropUnmapped: config.dropUnmapped
            }) as unknown as DataTransformer<T, R>;

        case TransformerType.FILTER:
            const predicateFn = (item: T) => {
                const value = (item as any)[config.field];
                switch (config.operator) {
                    case FilterOperator.EQUALS: return value === config.value;
                    case FilterOperator.NOT_EQUALS: return value !== config.value;
                    case FilterOperator.GREATER_THAN: return value > config.value;
                    case FilterOperator.LESS_THAN: return value < config.value;
                    case FilterOperator.GREATER_THAN_EQUALS: return value >= config.value;
                    case FilterOperator.LESS_THAN_EQUALS: return value <= config.value;
                    case FilterOperator.CONTAINS: return String(value).includes(String(config.value));
                    case FilterOperator.STARTS_WITH: return String(value).startsWith(String(config.value));
                    case FilterOperator.ENDS_WITH: return String(value).endsWith(String(config.value));
                    default: return false;
                }
            };
            return createFilterTransformer<T>({
                name: config.name,
                description: config.description,
                field: config.field,
                operator: config.operator,
                value: config.value,
                predicate: predicateFn
            }) as unknown as DataTransformer<T, R>;

        case TransformerType.MAP:
            const transformFn = (item: T) => {
                const result = { ...item };
                for (const op of config.operations) {
                    const value = (result as any)[op.field];
                    switch (op.operation) {
                        case MapOperation.TO_LOWER_CASE: (result as any)[op.field] = String(value).toLowerCase(); break;
                        case MapOperation.TO_UPPER_CASE: (result as any)[op.field] = String(value).toUpperCase(); break;
                        case MapOperation.TRIM: (result as any)[op.field] = String(value).trim(); break;
                        case MapOperation.NUMBER: (result as any)[op.field] = Number(value); break;
                        case MapOperation.BOOLEAN: (result as any)[op.field] = Boolean(value); break;
                        case MapOperation.STRING: (result as any)[op.field] = String(value); break;
                    }
                }
                return result as unknown as R;
            };
            return createMapTransformer<T, R>({
                name: config.name,
                description: config.description,
                field: config.operations[0].field,
                operation: config.operations[0].operation,
                transform: transformFn
            });

        default:
            throw new Error(`Unknown transformer type: ${(config as any).type}`);
    }
}

/**
 * Creates a pipeline of transformers from an array of dynamic configurations
 * @param configs Array of dynamic transformer configurations
 * @returns A new transformer pipeline
 */
export function createDynamicTransformerPipeline<T, R>(
    configs: DynamicTransformerConfigUnion[]
): DataTransformer<T, R> {
    const transformers = configs.map(config => createDynamicTransformer<T, R>(config));
    return {
        type: TransformerType.COMPLEX,
        transform: (data: T): R => {
            let currentData: any = data;
            for (const transformer of transformers) {
                currentData = transformer.transform(currentData);
            }
            return currentData as R;
        },
        transformBatch: (data: T[]): R[] => {
            let currentData: any[] = data;
            for (const transformer of transformers) {
                currentData = transformer.transformBatch(currentData);
            }
            return currentData as R[];
        }
    };
} 