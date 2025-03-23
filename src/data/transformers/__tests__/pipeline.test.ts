import { TransformerPipeline, createTransformerPipeline } from '../pipeline';
import { DataTransformer } from '../../types';

// Mock transformers for testing
const mockTransformers: DataTransformer<number, number>[] = [
    {
        transform: jest.fn().mockImplementation((data: number) => data + 1),
        transformBatch: jest.fn().mockImplementation((data: number[]) => data.map((x: number) => x + 1))
    },
    {
        transform: jest.fn().mockImplementation((data: number) => data * 2),
        transformBatch: jest.fn().mockImplementation((data: number[]) => data.map((x: number) => x * 2))
    }
];

describe('TransformerPipeline', () => {
    beforeEach(() => {
        // Clear all mock calls before each test
        mockTransformers.forEach(transformer => {
            jest.clearAllMocks();
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

        it('should fall back to individual transform when transformBatch is not available', () => {
            const customTransformer: DataTransformer<number, number> = {
                transform: jest.fn().mockImplementation((data: number) => data + 1)
            };
            const pipeline = new TransformerPipeline<number, number>([customTransformer]);
            const result = pipeline.transformBatch([1, 2, 3]);

            expect(customTransformer.transform).toHaveBeenCalledTimes(3);
            expect(result).toEqual([2, 3, 4]);
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
}); 