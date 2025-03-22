export interface DatabaseFormatterConfig {
    connection: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
        ssl?: boolean;
    };
    table: string;
}

export interface FormatConfig {
    type: string;
}

export class DataError extends Error {
    constructor(
        message: string,
        public source: string,
        public code: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'DataError';
    }
} 