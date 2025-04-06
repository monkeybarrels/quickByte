import { DataSource, DataFormat } from './types';

export class DataError extends Error {
    constructor(
        message: string,
        public source: DataSource | DataFormat,
        public code: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'DataError';
    }
} 