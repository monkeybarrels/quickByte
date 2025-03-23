import { TransformerPipeline, createTransformerPipeline } from '../pipeline';
import { DataTransformer, TransformerType } from '../../types';

// Mock transformers for testing
const mockTransformers: DataTransformer<number, number>[] = [
    {
        type: TransformerType.BATCH,
        transform: jest.fn().mockImplementation((data: number) => data + 1),
        transformBatch: jest.fn().mockImplementation((data: number[]) => data.map((x: number) => x + 1))
    },
    {
        type: TransformerType.BATCH,
        transform: jest.fn().mockImplementation((data: number) => data * 2),
        transformBatch: jest.fn().mockImplementation((data: number[]) => data.map((x: number) => x * 2))
    }
];

// Mock transformer for type transformation testing
const stringToNumberTransformer: DataTransformer<string, number> = {
    type: TransformerType.TYPE_CONVERT,
    transform: jest.fn().mockImplementation((data: string) => parseInt(data, 10)),
    transformBatch: jest.fn().mockImplementation((data: string[]) => data.map(x => parseInt(x, 10)))
};

// Mock transformer without transformBatch
const simpleTransformer: DataTransformer<number, number> = {
    type: TransformerType.SIMPLE,
    transform: jest.fn().mockImplementation((data: number) => data + 1),
    transformBatch: jest.fn().mockImplementation((data: number[]) => data.map(x => x + 1))
};

// Mock transformer that throws errors
const errorTransformer: DataTransformer<number, number> = {
    type: TransformerType.ERROR,
    transform: jest.fn().mockImplementation(() => {
        throw new Error('Transform error');
    }),
    transformBatch: jest.fn().mockImplementation(() => {
        throw new Error('TransformBatch error');
    })
};

describe('TransformerPipeline', () => {
    beforeEach(() => {
        // Clear all mock calls before each test
        mockTransformers.forEach(transformer => {
            jest.clearAllMocks();
        });
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should handle null transformers array', () => {
            // @ts-ignore - Testing runtime behavior
            expect(() => new TransformerPipeline(null)).toThrow();
        });

        it('should handle undefined transformers array', () => {
            // @ts-ignore - Testing runtime behavior
            expect(() => new TransformerPipeline(undefined)).toThrow();
        });
    });

    describe('transform', () => {
        it('should chain multiple transformers in sequence', () => {
            const pipeline = new TransformerPipeline<number, number>(mockTransformers);
            const result = pipeline.transform(5);

            // Verify the transformers were called in sequence
            expect(mockTransformers[0].transform).toHaveBeenCalledWith(5);
            expect(mockTransformers[1].transform).toHaveBeenCalledWith(6);
            expect(result).toBe(12); // (5 + 1) * 2
        });

        it('should handle a single transformer', () => {
            const pipeline = new TransformerPipeline<number, number>([mockTransformers[0]]);
            const result = pipeline.transform(5);

            expect(mockTransformers[0].transform).toHaveBeenCalledWith(5);
            expect(result).toBe(6); // 5 + 1
        });

        it('should handle empty transformer array', () => {
            const pipeline = new TransformerPipeline<number, number>([]);
            const result = pipeline.transform(5);

            expect(result).toBe(5); // Should return input unchanged
        });

        it('should handle type transformations', () => {
            const pipeline = new TransformerPipeline<string, number>([
                stringToNumberTransformer,
                ...mockTransformers
            ]);
            const result = pipeline.transform('5');

            expect(stringToNumberTransformer.transform).toHaveBeenCalledWith('5');
            expect(mockTransformers[0].transform).toHaveBeenCalledWith(5);
            expect(mockTransformers[1].transform).toHaveBeenCalledWith(6);
            expect(result).toBe(12); // (parseInt('5') + 1) * 2
        });

        it('should propagate errors from transformers', () => {
            const pipeline = new TransformerPipeline<number, number>([errorTransformer]);
            
            expect(() => pipeline.transform(5)).toThrow('Transform error');
        });

        it('should handle complex data types', () => {
            interface ComplexData {
                value: number;
                label: string;
            }

            const complexTransformer: DataTransformer<ComplexData, ComplexData> = {
                type: TransformerType.BATCH,
                transform: jest.fn().mockImplementation((data: ComplexData) => ({
                    value: data.value + 1,
                    label: data.label
                })),
                transformBatch: jest.fn().mockImplementation((data: ComplexData[]) => 
                    data.map(x => ({ value: x.value + 1, label: x.label }))
                )
            };

            const pipeline = new TransformerPipeline<ComplexData, ComplexData>([complexTransformer]);
            const input = { value: 5, label: 'test' };
            const result = pipeline.transform(input);

            expect(complexTransformer.transform).toHaveBeenCalledWith(input);
            expect(result).toEqual({ value: 6, label: 'test' });
        });
    });

    describe('transformBatch', () => {
        it('should chain multiple transformers in sequence for batch processing', () => {
            const pipeline = new TransformerPipeline<number, number>(mockTransformers);
            const result = pipeline.transformBatch([1, 2, 3]);

            // Verify the transformers were called in sequence
            expect(mockTransformers[0].transformBatch).toHaveBeenCalledWith([1, 2, 3]);
            expect(mockTransformers[1].transformBatch).toHaveBeenCalledWith([2, 3, 4]);
            expect(result).toEqual([4, 6, 8]); // [(1+1)*2, (2+1)*2, (3+1)*2]
        });

        it('should handle a single transformer', () => {
            const pipeline = new TransformerPipeline<number, number>([mockTransformers[0]]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(mockTransformers[0].transformBatch).toHaveBeenCalledWith([1, 2, 3]);
            expect(result).toEqual([2, 3, 4]);
        });

        it('should handle empty transformer array', () => {
            const pipeline = new TransformerPipeline<number, number>([]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(result).toEqual([1, 2, 3]); // Should return input unchanged
        });

        it('should handle batch transformations', () => {
            const customTransformer: DataTransformer<number, number> = {
                type: TransformerType.BATCH,
                transform: jest.fn().mockImplementation((data: number) => data + 1),
                transformBatch: jest.fn().mockImplementation((data: number[]) => data.map(x => x + 1))
            };
            const pipeline = new TransformerPipeline<number, number>([customTransformer]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(customTransformer.transformBatch).toHaveBeenCalledTimes(1);
            expect(result).toEqual([2, 3, 4]);
        });

        it('should handle transformers without transformBatch method', () => {
            const pipeline = new TransformerPipeline<number, number>([simpleTransformer]);
            // @ts-ignore - Testing runtime behavior
            delete simpleTransformer.transformBatch;
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(simpleTransformer.transform).toHaveBeenCalledTimes(3);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(1, 1);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(2, 2);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(3, 3);
            expect(result).toEqual([2, 3, 4]);
        });

        it('should propagate errors from transformers in batch mode', () => {
            const pipeline = new TransformerPipeline<number, number>([errorTransformer]);
            
            expect(() => pipeline.transformBatch([1, 2, 3])).toThrow('TransformBatch error');
        });

        it('should handle empty input array', () => {
            const pipeline = new TransformerPipeline<number, number>(mockTransformers);
            const result = pipeline.transformBatch([]);

            expect(result).toEqual([]);
            expect(mockTransformers[0].transformBatch).not.toHaveBeenCalled();
            expect(mockTransformers[1].transformBatch).not.toHaveBeenCalled();
        });

        it('should handle mixed transformers with and without transformBatch', () => {
            const pipeline = new TransformerPipeline<number, number>([
                mockTransformers[0],
                simpleTransformer,
                mockTransformers[1]
            ]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(mockTransformers[0].transformBatch).toHaveBeenCalledWith([1, 2, 3]);
            expect(simpleTransformer.transform).toHaveBeenCalledTimes(3);
            expect(mockTransformers[1].transformBatch).toHaveBeenCalledWith([3, 4, 5]);
            expect(result).toEqual([6, 8, 10]); // [(1+1+1)*2, (2+1+1)*2, (3+1+1)*2]
        });

        it('should fall back to transform when transformBatch is not available', () => {
            const pipeline = new TransformerPipeline<number, number>([simpleTransformer]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(simpleTransformer.transform).toHaveBeenCalledTimes(3);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(1, 1);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(2, 2);
            expect(simpleTransformer.transform).toHaveBeenNthCalledWith(3, 3);
            expect(result).toEqual([2, 3, 4]);
        });
    });
});

describe('createTransformerPipeline', () => {
    it('should create a new TransformerPipeline instance', () => {
        const pipeline = createTransformerPipeline<number, number>(mockTransformers);
        expect(pipeline).toBeInstanceOf(TransformerPipeline);
        
        // Verify it works as expected
        const result = pipeline.transform(5);
        expect(result).toBe(12); // (5 + 1) * 2
    });

    it('should handle empty transformers array', () => {
        const pipeline = createTransformerPipeline<number, number>([]);
        expect(pipeline).toBeInstanceOf(TransformerPipeline);
        
        const result = pipeline.transform(5);
        expect(result).toBe(5);
    });

    it('should handle type transformations', () => {
        const pipeline = createTransformerPipeline<string, number>([
            stringToNumberTransformer,
            ...mockTransformers
        ]);
        expect(pipeline).toBeInstanceOf(TransformerPipeline);
        
        const result = pipeline.transform('5');
        expect(result).toBe(12); // (parseInt('5') + 1) * 2
    });
}); 