import { DataFormatter, CsvFormatterConfig, FormatConfig, DataError } from '../types';

/**
 * A formatter class that handles CSV data formatting and parsing.
 * This class implements the DataFormatter interface for CSV-specific operations.
 * 
 * @template T - The type of data being formatted/parsed
 */
export class CsvFormatter<T> implements DataFormatter<T, string> {
    private config: CsvFormatterConfig;

    /**
     * Creates a new instance of CsvFormatter.
     * 
     * @param config - Configuration object containing CSV formatting options
     * @param config.headers - Array of header names for the CSV
     * @param config.delimiter - Optional delimiter character (defaults to ',')
     */
    constructor(config: CsvFormatterConfig) {
        this.config = config;
    }

    /**
     * Formats an array of data items into a CSV string.
     * 
     * @param data - Array of data items to format
     * @param config - Format configuration options
     * @returns Promise resolving to a CSV string
     * @throws {DataError} If formatting fails
     */
    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            if (data.length === 0) {
                return this.config.headers.join(this.config.delimiter || ',');
            }

            const rows = [
                this.config.headers,
                ...data.map(item => 
                    this.config.headers.map(header => 
                        String((item as any)[header] || '')
                    )
                )
            ];

            return rows
                .map(row => row.join(this.config.delimiter || ','))
                .join('\n');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV formatting failed: ${error.message}`,
                    'file',
                    'FORMAT_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV formatting failed: Unknown error',
                'file',
                'FORMAT_ERROR'
            );
        }
    }

    /**
     * Parses a CSV string into an array of typed data items.
     * 
     * @param data - CSV string to parse
     * @param config - Format configuration options
     * @returns Promise resolving to an array of parsed data items
     * @throws {DataError} If parsing fails
     */
    async parse(data: string, config: FormatConfig): Promise<T[]> {
        try {
            const lines = data.split('\n');
            if (lines.length < 2) {
                return [];
            }

            const headers = lines[0].split(this.config.delimiter || ',');
            const result: T[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(this.config.delimiter || ',');
                const item: any = {};
                
                headers.forEach((header, index) => {
                    item[header] = values[index] || '';
                });

                result.push(item as T);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV parsing failed: ${error.message}`,
                    'file',
                    'PARSE_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV parsing failed: Unknown error',
                'file',
                'PARSE_ERROR'
            );
        }
    }
}

/**
 * Factory function to create a new CsvFormatter instance.
 * 
 * @template T - The type of data being formatted/parsed
 * @param config - Configuration object containing CSV formatting options
 * @returns A new CsvFormatter instance
 */
export function createCsvFormatter<T>(config: CsvFormatterConfig): CsvFormatter<T> {
    return new CsvFormatter<T>(config);
} 