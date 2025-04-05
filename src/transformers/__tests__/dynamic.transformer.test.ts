import { createDynamicTransformer, createDynamicTransformerPipeline } from '../dynamic.transformer';
import { DynamicFieldMappingConfig, DynamicFilterConfig, DynamicMapConfig, DynamicTransformerConfigUnion } from '../dynamic.transformer';
import { TransformerType, FilterOperator, MapOperation } from '../../types';

describe('Dynamic Transformer', () => {
    describe('Field Mapping Transformer', () => {
        it('should map fields correctly', () => {
            const config: DynamicFieldMappingConfig = {
                type: TransformerType.FIELD_MAPPING,
                fieldMap: {
                    firstName: 'name',
                    age: 'years'
                }
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { firstName: 'John', age: 30 };
            const result = transformer.transform(input);

            expect(result).toEqual({
                name: 'John',
                years: 30
            });
        });

        it('should drop unmapped fields when dropUnmapped is true', () => {
            const config: DynamicFieldMappingConfig = {
                type: TransformerType.FIELD_MAPPING,
                fieldMap: {
                    firstName: 'name'
                },
                dropUnmapped: true
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { firstName: 'John', age: 30 };
            const result = transformer.transform(input);

            expect(result).toEqual({
                name: 'John'
            });
        });

        it('should handle empty field map', () => {
            const config: DynamicFieldMappingConfig = {
                type: TransformerType.FIELD_MAPPING,
                fieldMap: {}
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { firstName: 'John', age: 30 };
            const result = transformer.transform(input);

            expect(result).toEqual(input);
        });

        it('should handle nested field mapping', () => {
            const config: DynamicFieldMappingConfig = {
                type: TransformerType.FIELD_MAPPING,
                fieldMap: {
                    'user.name': 'name',
                    'user.age': 'age'
                }
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { user: { name: 'John', age: 30 } };
            const result = transformer.transform(input);

            expect(result).toEqual({
                user: { name: 'John', age: 30 }
            });
        });
    });

    describe('Filter Transformer', () => {
        it('should filter based on equality', () => {
            const config: DynamicFilterConfig = {
                type: TransformerType.FILTER,
                field: 'age',
                operator: FilterOperator.EQUALS,
                value: 30
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { name: 'John', age: 30 };
            const result = transformer.transform(input);

            expect(result).toEqual(input);
        });

        it('should filter based on contains', () => {
            const config: DynamicFilterConfig = {
                type: TransformerType.FILTER,
                field: 'name',
                operator: FilterOperator.CONTAINS,
                value: 'oh'
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { name: 'John', age: 30 };
            const result = transformer.transform(input);

            expect(result).toEqual(input);
        });

        it('should handle all comparison operators', () => {
            const operators: DynamicFilterConfig['operator'][] = [
                FilterOperator.EQUALS,
                FilterOperator.NOT_EQUALS,
                FilterOperator.GREATER_THAN,
                FilterOperator.LESS_THAN,
                FilterOperator.GREATER_THAN_EQUALS,
                FilterOperator.LESS_THAN_EQUALS
            ];
            const testCases = [
                { value: 30, expected: true },
                { value: 20, expected: false },
                { value: 40, expected: false }
            ];

            operators.forEach(operator => {
                testCases.forEach(({ value, expected }) => {
                    const config: DynamicFilterConfig = {
                        type: TransformerType.FILTER,
                        field: 'age',
                        operator,
                        value: 30
                    };

                    const transformer = createDynamicTransformer<any, any>(config);
                    const input = { name: 'John', age: value };
                    const result = transformer.transformBatch([input]);

                    if (operator === FilterOperator.EQUALS) {
                        expect(result).toEqual(expected ? [input] : []);
                    } else if (operator === FilterOperator.NOT_EQUALS) {
                        expect(result).toEqual(!expected ? [input] : []);
                    } else if (operator === FilterOperator.GREATER_THAN) {
                        expect(result).toEqual(value > 30 ? [input] : []);
                    } else if (operator === FilterOperator.LESS_THAN) {
                        expect(result).toEqual(value < 30 ? [input] : []);
                    } else if (operator === FilterOperator.GREATER_THAN_EQUALS) {
                        expect(result).toEqual(value >= 30 ? [input] : []);
                    } else if (operator === FilterOperator.LESS_THAN_EQUALS) {
                        expect(result).toEqual(value <= 30 ? [input] : []);
                    }
                });
            });
        });

        it('should handle string operators', () => {
            const operators: DynamicFilterConfig['operator'][] = [
                FilterOperator.CONTAINS,
                FilterOperator.STARTS_WITH,
                FilterOperator.ENDS_WITH
            ];
            const testCases = [
                { value: 'John Doe', expected: true },
                { value: 'Jane Doe', expected: false }
            ];

            operators.forEach(operator => {
                testCases.forEach(({ value, expected }) => {
                    const config: DynamicFilterConfig = {
                        type: TransformerType.FILTER,
                        field: 'name',
                        operator,
                        value: operator === FilterOperator.CONTAINS ? 'ohn' : 
                               operator === FilterOperator.STARTS_WITH ? 'Jo' : 'oe'
                    };

                    const transformer = createDynamicTransformer<any, any>(config);
                    const input = { name: value, age: 30 };
                    const result = transformer.transformBatch([input]);

                    if (operator === FilterOperator.CONTAINS) {
                        expect(result).toEqual(value.includes('ohn') ? [input] : []);
                    } else if (operator === FilterOperator.STARTS_WITH) {
                        expect(result).toEqual(value.startsWith('Jo') ? [input] : []);
                    } else if (operator === FilterOperator.ENDS_WITH) {
                        expect(result).toEqual(value.endsWith('oe') ? [input] : []);
                    }
                });
            });
        });

        it('should handle missing fields', () => {
            const config: DynamicFilterConfig = {
                type: TransformerType.FILTER,
                field: 'missing',
                operator: FilterOperator.EQUALS,
                value: 30
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { name: 'John', age: 30 };
            const result = transformer.transformBatch([input]);

            expect(result).toEqual([]);
        });
    });

    describe('Map Transformer', () => {
        it('should apply string transformations', () => {
            const config: DynamicMapConfig = {
                type: TransformerType.MAP,
                operations: [
                    { field: 'name', operation: MapOperation.TO_UPPER_CASE },
                    { field: 'email', operation: MapOperation.TO_LOWER_CASE }
                ]
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { name: 'John', email: 'JOHN@EXAMPLE.COM' };
            const result = transformer.transform(input);

            expect(result).toEqual({
                name: 'JOHN',
                email: 'john@example.com'
            });
        });

        it('should apply type conversions', () => {
            const config: DynamicMapConfig = {
                type: TransformerType.MAP,
                operations: [
                    { field: 'age', operation: MapOperation.NUMBER },
                    { field: 'isActive', operation: MapOperation.BOOLEAN }
                ]
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { age: '30', isActive: 'true' };
            const result = transformer.transform(input);

            expect(result).toEqual({
                age: 30,
                isActive: true
            });
        });

        it('should handle all transformation operations', () => {
            const operations: DynamicMapConfig['operations'][0]['operation'][] = 
                [MapOperation.TO_LOWER_CASE, MapOperation.TO_UPPER_CASE, MapOperation.TRIM, 
                 MapOperation.NUMBER, MapOperation.BOOLEAN, MapOperation.STRING];

            operations.forEach(operation => {
                const config: DynamicMapConfig = {
                    type: TransformerType.MAP,
                    operations: [{ field: 'value', operation }]
                };

                const transformer = createDynamicTransformer<any, any>(config);
                const input = { value: '  Test  ' };
                const result = transformer.transform(input);

                switch (operation) {
                    case MapOperation.TO_LOWER_CASE:
                        expect(result.value).toBe('  test  ');
                        break;
                    case MapOperation.TO_UPPER_CASE:
                        expect(result.value).toBe('  TEST  ');
                        break;
                    case MapOperation.TRIM:
                        expect(result.value).toBe('Test');
                        break;
                    case MapOperation.NUMBER:
                        expect(result.value).toBeNaN();
                        break;
                    case MapOperation.BOOLEAN:
                        expect(result.value).toBe(true);
                        break;
                    case MapOperation.STRING:
                        expect(result.value).toBe('  Test  ');
                        break;
                }
            });
        });

        it('should handle missing fields gracefully', () => {
            const config: DynamicMapConfig = {
                type: TransformerType.MAP,
                operations: [
                    { field: 'missing', operation: MapOperation.TO_UPPER_CASE }
                ]
            };

            const transformer = createDynamicTransformer<any, any>(config);
            const input = { name: 'John' };
            const result = transformer.transform(input);

            expect(result).toEqual({
                name: 'John',
                missing: 'UNDEFINED'
            });
        });
    });

    describe('Transformer Pipeline', () => {
        it('should apply multiple transformers in sequence', () => {
            const configs: DynamicTransformerConfigUnion[] = [
                {
                    type: TransformerType.FIELD_MAPPING,
                    fieldMap: {
                        firstName: 'name'
                    }
                },
                {
                    type: TransformerType.MAP,
                    operations: [
                        { field: 'name', operation: MapOperation.TO_UPPER_CASE }
                    ]
                },
                {
                    type: TransformerType.FILTER,
                    field: 'age',
                    operator: FilterOperator.GREATER_THAN_EQUALS,
                    value: 18
                }
            ];

            const pipeline = createDynamicTransformerPipeline<any, any>(configs);
            const input = { firstName: 'John', age: 20 };
            const result = pipeline.transform(input);

            expect(result).toEqual({ name: 'JOHN', age: 20 });
        });

        it('should handle batch transformations', () => {
            const configs: DynamicTransformerConfigUnion[] = [
                {
                    type: TransformerType.FIELD_MAPPING,
                    fieldMap: {
                        firstName: 'name'
                    }
                },
                {
                    type: TransformerType.MAP,
                    operations: [
                        { field: 'name', operation: MapOperation.TO_UPPER_CASE }
                    ]
                }
            ];

            const pipeline = createDynamicTransformerPipeline<any, any>(configs);
            const input = [
                { firstName: 'John', age: 20 },
                { firstName: 'Jane', age: 25 }
            ];
            const result = pipeline.transformBatch(input);

            expect(result).toEqual([
                { name: 'JOHN', age: 20 },
                { name: 'JANE', age: 25 }
            ]);
        });

        it('should handle empty pipeline', () => {
            const pipeline = createDynamicTransformerPipeline<any, any>([]);
            const input = { name: 'John', age: 30 };
            const result = pipeline.transform(input);

            expect(result).toEqual(input);
        });

        it('should handle filter in pipeline', () => {
            const configs: DynamicTransformerConfigUnion[] = [
                {
                    type: TransformerType.FILTER,
                    field: 'age',
                    operator: FilterOperator.GREATER_THAN_EQUALS,
                    value: 18
                }
            ];

            const pipeline = createDynamicTransformerPipeline<any, any>(configs);
            const input = { name: 'John', age: 20 };
            const result = pipeline.transform(input);

            expect(result).toEqual(input);
        });

        it('should handle multiple filters in pipeline', () => {
            const configs: DynamicTransformerConfigUnion[] = [
                {
                    type: TransformerType.FILTER,
                    field: 'age',
                    operator: FilterOperator.GREATER_THAN_EQUALS,
                    value: 18
                },
                {
                    type: TransformerType.FILTER,
                    field: 'name',
                    operator: FilterOperator.CONTAINS,
                    value: 'oh'
                }
            ];

            const pipeline = createDynamicTransformerPipeline<any, any>(configs);
            const input = { name: 'John', age: 20 };
            const result = pipeline.transform(input);

            expect(result).toEqual(input);
        });
    });
}); 