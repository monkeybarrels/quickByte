import { DataFormatter, FormatConfig, CsvFormatterConfig, DataError, DataFormat } from '../types';

/**
 * A formatter class that handles CSV data formatting and parsing.
 * This class implements the DataFormatter interface for CSV-specific operations.
 * 
 * @template T - The type of data being formatted/parsed
 */
export class CsvFormatter<T> implements DataFormatter<T> {
    private config: FormatConfig;

    /**
     * Creates a new instance of CsvFormatter.
     * 
     * @param config - Configuration object containing CSV formatting options
     * @param config.headers - Array of header names for the CSV
     * @param config.delimiter - Optional delimiter character (defaults to ',')
     */
    constructor(config: FormatConfig) {
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
            const csvConfig = config.options as unknown as CsvFormatterConfig;
            if (!csvConfig?.headers) {
                throw new Error('CSV headers are required');
            }

            const headers = csvConfig.headers;
            const delimiter = csvConfig.delimiter || ',';

            // Check for circular references
            try {
                JSON.stringify(data);
            } catch (error) {
                throw new Error('Circular reference detected in data');
            }

            // Return empty string for empty data array
            if (!data.length) {
                return '';
            }

            // Create CSV header
            const headerRow = headers.join(delimiter);

            // Create CSV rows
            const rows = data.map(item => {
                const row = headers.map(header => {
                    const value = (item as any)[header];
                    return value !== undefined ? String(value) : '';
                });
                return row.join(delimiter);
            });

            return [headerRow, ...rows].join('\n');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV formatting failed: ${error.message}`,
                    DataFormat.CSV,
                    'CSV_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV formatting failed: Unknown error',
                DataFormat.CSV,
                'CSV_ERROR'
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
            const csvConfig = config.options as unknown as CsvFormatterConfig;
            if (!csvConfig?.headers) {
                throw new Error('CSV headers are required');
            }

            const headers = csvConfig.headers;
            const delimiter = csvConfig.delimiter || ',';

            const lines = data.split('\n');
            const result: T[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(delimiter);
                if (values.length !== headers.length) {
                    throw new Error(`Invalid CSV: Row ${i} has ${values.length} columns, expected ${headers.length}`);
                }

                const row: Record<string, string | number> = {};

                headers.forEach((header, index) => {
                    const value = values[index]?.trim() || '';
                    // Convert numeric values
                    row[header] = !isNaN(Number(value)) ? Number(value) : value;
                });

                result.push(row as T);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `CSV parsing failed: ${error.message}`,
                    DataFormat.CSV,
                    'CSV_ERROR',
                    error
                );
            }
            throw new DataError(
                'CSV parsing failed: Unknown error',
                DataFormat.CSV,
                'CSV_ERROR'
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
export function createCsvFormatter<T>(config?: FormatConfig): CsvFormatter<T> {
    return new CsvFormatter<T>(config || { type: DataFormat.CSV });
} 