import { DataFormatter, JsonFormatterConfig, FormatConfig, DataError } from '../types';

export class JsonFormatter<T> implements DataFormatter<T, string> {
    private config: JsonFormatterConfig;

    constructor(config: JsonFormatterConfig = {}) {
        this.config = config;
    }

    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            return JSON.stringify(data, null, this.config.pretty ? 2 : undefined);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `JSON formatting failed: ${error.message}`,
                    'file',
                    'FORMAT_ERROR',
                    error
                );
            }
            throw new DataError(
                'JSON formatting failed: Unknown error',
                'file',
                'FORMAT_ERROR'
            );
        }
    }

    async parse(data: string, config: FormatConfig): Promise<T[]> {
        try {
            return JSON.parse(data) as T[];
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `JSON parsing failed: ${error.message}`,
                    'file',
                    'PARSE_ERROR',
                    error
                );
            }
            throw new DataError(
                'JSON parsing failed: Unknown error',
                'file',
                'PARSE_ERROR'
            );
        }
    }
}

export function createJsonFormatter<T>(config: JsonFormatterConfig = {}): JsonFormatter<T> {
    return new JsonFormatter<T>(config);
} 