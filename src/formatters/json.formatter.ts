import { DataFormatter, FormatConfig, DataFormat, DataError } from '../types';

/**
 * A formatter class that handles JSON data serialization and deserialization.
 * Implements the DataFormatter interface for type-safe data handling.
 * 
 * @template T - The type of data being formatted
 */
export class JsonFormatter<T> implements DataFormatter<T> {
    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            const options = config.options as { pretty?: boolean } || {};
            return JSON.stringify(data, null, options.pretty ? 2 : undefined);
        } catch (error) {
            throw new DataError(
                `Failed to format JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                DataFormat.JSON,
                'JSON_FORMAT_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }

    async parse(data: string, config: FormatConfig): Promise<T[]> {
        try {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
                throw new Error('Parsed JSON must be an array');
            }
            return parsed;
        } catch (error) {
            throw new DataError(
                `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                DataFormat.JSON,
                'JSON_PARSE_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }
}

/**
 * Factory function to create a new JsonFormatter instance.
 * 
 * @template T - The type of data being formatted
 * @returns A new JsonFormatter instance
 */
export function createJsonFormatter<T>(): JsonFormatter<T> {
    return new JsonFormatter<T>();
} 