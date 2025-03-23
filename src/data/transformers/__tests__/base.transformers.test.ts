import {
    BaseTransformer,
    FieldMappingTransformer,
    FilterTransformer,
    MapTransformer,
    createFieldMappingTransformer,
    createFilterTransformer,
    createMapTransformer
} from '../base.transformers';
import { TransformerConfig, FieldMappingConfig, FilterConfig, MapConfig, TransformerType, FilterOperator, MapOperation } from '../../types';

describe('BaseTransformer', () => {
    class TestTransformer extends BaseTransformer<string, number> {
        transform(data: string): number {
            return data.length;
        }
    }

    it('should transform single items', () => {
        const transformer = new TestTransformer({ 
            name: 'test',
            transform: (data: string) => data.length 
        }, TransformerType.SIMPLE);
        expect(transformer.transform('hello')).toBe(5);
    });

    it('should transform batch items', () => {
        const transformer = new TestTransformer({ 
            name: 'test',
            transform: (data: string) => data.length 
        }, TransformerType.SIMPLE);
        expect(transformer.transformBatch(['a', 'bb', 'ccc'])).toEqual([1, 2, 3]);
    });
});

describe('FieldMappingTransformer', () => {
    const config: FieldMappingConfig<Record<string, unknown>, Record<string, unknown>> = {
        name: 'fieldMapper',
        fieldMap: {
            firstName: 'name',
            age: 'years',
            email: 'contact'
        },
        dropUnmapped: false
    };

    it('should map fields correctly', () => {
        const transformer = new FieldMappingTransformer(config);
        const input = {
            firstName: 'John',
            age: 30,
            email: 'john@example.com',
            extra: 'value'
        };

        const result = transformer.transform(input);
        expect(result).toEqual({
            name: 'John',
            years: 30,
            contact: 'john@example.com',
            extra: 'value'
        });
    });

    it('should drop unmapped fields when configured', () => {
        const strictConfig: FieldMappingConfig<Record<string, unknown>, Record<string, unknown>> = {
            ...config,
            dropUnmapped: true
        };
        const transformer = new FieldMappingTransformer(strictConfig);
        const input = {
            firstName: 'John',
            age: 30,
            email: 'john@example.com',
            extra: 'value'
        };

        const result = transformer.transform(input);
        expect(result).toEqual({
            name: 'John',
            years: 30,
            contact: 'john@example.com'
        });
    });

    it('should handle missing source fields', () => {
        const transformer = new FieldMappingTransformer(config);
        const input = {
            firstName: 'John',
            // age is missing
            email: 'john@example.com'
        };

        const result = transformer.transform(input);
        expect(result).toEqual({
            name: 'John',
            contact: 'john@example.com'
        });
    });
});

describe('FilterTransformer', () => {
    const config: FilterConfig<number> = {
        name: 'numberFilter',
        field: 'value',
        operator: FilterOperator.GREATER_THAN,
        value: 0,
        predicate: (num: number) => num > 0
    };

    it('should pass items matching the predicate', () => {
        const transformer = new FilterTransformer(config);
        expect(transformer.transform(5)).toBe(5);
    });

    it('should throw error for items not matching the predicate', () => {
        const transformer = new FilterTransformer(config);
        expect(() => transformer.transform(-1)).toThrow('Item does not match filter criteria');
    });

    it('should filter batch items correctly', () => {
        const transformer = new FilterTransformer(config);
        expect(transformer.transformBatch([-1, 2, -3, 4, 5])).toEqual([2, 4, 5]);
    });
});

describe('MapTransformer', () => {
    const config: MapConfig<string, number> = {
        name: 'stringToLength',
        field: 'value',
        operation: MapOperation.NUMBER,
        transform: (str: string) => str.length
    };

    it('should transform single items', () => {
        const transformer = new MapTransformer(config);
        expect(transformer.transform('hello')).toBe(5);
    });

    it('should transform batch items', () => {
        const transformer = new MapTransformer(config);
        expect(transformer.transformBatch(['a', 'bb', 'ccc'])).toEqual([1, 2, 3]);
    });
});

describe('Factory Functions', () => {
    it('should create FieldMappingTransformer', () => {
        const config: FieldMappingConfig<Record<string, unknown>, Record<string, unknown>> = {
            name: 'test',
            fieldMap: { a: 'b' }
        };
        const transformer = createFieldMappingTransformer(config);
        expect(transformer).toBeInstanceOf(FieldMappingTransformer);
    });

    it('should create FilterTransformer', () => {
        const config: FilterConfig<number> = {
            name: 'test',
            field: 'value',
            operator: FilterOperator.GREATER_THAN,
            value: 0,
            predicate: (n: number) => n > 0
        };
        const transformer = createFilterTransformer(config);
        expect(transformer).toBeInstanceOf(FilterTransformer);
    });

    it('should create MapTransformer', () => {
        const config: MapConfig<string, number> = {
            name: 'test',
            field: 'value',
            operation: MapOperation.NUMBER,
            transform: (s: string) => s.length
        };
        const transformer = createMapTransformer(config);
        expect(transformer).toBeInstanceOf(MapTransformer);
    });
}); 