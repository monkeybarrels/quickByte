import { DatabaseFormatter, createDatabaseFormatter } from '../database.formatter';
import { DataError, FormatConfig, DataFormat } from '../../types';
import { Pool, QueryResult } from 'pg';

// Mock the pg Pool
jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

interface TestData {
    id: number;
    name: string;
    value: string;
}

const mockConfig = {
    connection: {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'testuser',
        password: 'testpass',
        ssl: false
    },
    table: 'test_table'
};

const defaultFormatConfig: FormatConfig = {
    type: DataFormat.JSON
};

describe('DatabaseFormatter', () => {
    let formatter: DatabaseFormatter<TestData>;
    let mockClient: any;
    let mockPool: any;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock client
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };

        // Setup mock pool
        mockPool = new Pool();
        mockPool.connect.mockResolvedValue(mockClient);

        formatter = new DatabaseFormatter<TestData>(mockConfig);
    });

    describe('constructor', () => {
        it('should create a pool with SSL configuration when enabled', () => {
            const sslConfig = {
                ...mockConfig,
                connection: {
                    ...mockConfig.connection,
                    ssl: true
                }
            };
            new DatabaseFormatter<TestData>(sslConfig);
            expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
                ssl: { rejectUnauthorized: false }
            }));
        });

        it('should create a pool without SSL configuration when disabled', () => {
            new DatabaseFormatter<TestData>(mockConfig);
            expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
                ssl: false
            }));
        });
    });

    describe('format', () => {
        const testData: TestData[] = [
            { id: 1, name: 'test1', value: 'value1' },
            { id: 2, name: 'test2', value: 'value2' }
        ];

        it('should successfully format and insert data', async () => {
            // Mock successful transaction
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // TRUNCATE
                .mockResolvedValueOnce({ rows: [] }) // First INSERT
                .mockResolvedValueOnce({ rows: [] }) // Second INSERT
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            await formatter.format(testData, defaultFormatConfig);

            // Verify transaction flow
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('TRUNCATE TABLE test_table');
            expect(mockClient.query).toHaveBeenCalledWith(
                'INSERT INTO test_table (id, name, value) VALUES ($1, $2, $3)',
                [1, 'test1', 'value1']
            );
            expect(mockClient.query).toHaveBeenCalledWith(
                'INSERT INTO test_table (id, name, value) VALUES ($1, $2, $3)',
                [2, 'test2', 'value2']
            );
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should rollback transaction on error', async () => {
            // Mock error during insert
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // TRUNCATE
                .mockRejectedValueOnce(new Error('Insert failed')); // INSERT fails

            await expect(formatter.format(testData, defaultFormatConfig)).rejects.toThrow(DataError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should handle empty data array', async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // TRUNCATE
                .mockResolvedValueOnce({ rows: [] }); // COMMIT

            await formatter.format([], defaultFormatConfig);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith('TRUNCATE TABLE test_table');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should handle non-Error exceptions', async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] }) // TRUNCATE
                .mockRejectedValueOnce('string error'); // Non-Error exception

            await expect(formatter.format(testData, defaultFormatConfig)).rejects.toThrow(DataError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('parse', () => {
        const mockResult: TestData[] = [
            { id: 1, name: 'test1', value: 'value1' },
            { id: 2, name: 'test2', value: 'value2' }
        ];

        it('should successfully parse data from database', async () => {
            const mockQueryResult: QueryResult = {
                rows: mockResult,
                command: 'SELECT',
                rowCount: 2,
                fields: [],
                oid: 0
            };

            mockPool.query.mockResolvedValueOnce(mockQueryResult);

            const result = await formatter.parse(undefined, defaultFormatConfig);

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM test_table');
            expect(result).toEqual(mockResult);
        });

        it('should throw DataError on query failure', async () => {
            mockPool.query.mockRejectedValueOnce(new Error('Query failed'));

            await expect(formatter.parse(undefined, defaultFormatConfig)).rejects.toThrow(DataError);
        });

        it('should handle non-Error exceptions', async () => {
            mockPool.query.mockRejectedValueOnce('string error');

            await expect(formatter.parse(undefined, defaultFormatConfig)).rejects.toThrow(DataError);
        });
    });
});

describe('createDatabaseFormatter', () => {
    it('should create a new DatabaseFormatter instance', () => {
        const formatter = createDatabaseFormatter<TestData>(mockConfig);
        expect(formatter).toBeInstanceOf(DatabaseFormatter);
    });
}); 