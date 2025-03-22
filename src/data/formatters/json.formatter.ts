import { DataFormatter, JsonFormatterConfig, FormatConfig, DataError } from '../types';

/**
 * A formatter class that handles JSON data serialization and deserialization.
 * Implements the DataFormatter interface for type-safe data handling.
 * 
 * @template T - The type of data being formatted
 */
export class JsonFormatter<T> implements DataFormatter<T, string> {
    private config: JsonFormatterConfig;

    /**
     * Creates a new JsonFormatter instance.
     * 
     * @param config - Configuration options for JSON formatting
     */
    constructor(config: JsonFormatterConfig = {}) {
        this.config = config;
    }

    /**
     * Formats an array of data into a JSON string.
     * 
     * @param data - Array of data to be formatted
     * @param config - Format configuration options
     * @returns Promise resolving to a formatted JSON string
     * @throws {DataError} If JSON formatting fails
     */
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

    /**
     * Parses a JSON string into an array of typed data.
     * 
     * @param data - JSON string to be parsed
     * @param config - Parse configuration options
     * @returns Promise resolving to an array of parsed data
     * @throws {DataError} If JSON parsing fails
     */
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

/**
 * Factory function to create a new JsonFormatter instance.
 * 
 * @template T - The type of data being formatted
 * @param config - Configuration options for JSON formatting
 * @returns A new JsonFormatter instance
 */
export function createJsonFormatter<T>(config: JsonFormatterConfig = {}): JsonFormatter<T> {
    return new JsonFormatter<T>(config);
} 