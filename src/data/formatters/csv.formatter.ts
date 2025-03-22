import { DataFormatter, CsvFormatterConfig, FormatConfig, DataError } from '../types';

export class CsvFormatter<T> implements DataFormatter<T, string> {
    private config: CsvFormatterConfig;

    constructor(config: CsvFormatterConfig) {
        this.config = config;
    }

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

export function createCsvFormatter<T>(config: CsvFormatterConfig): CsvFormatter<T> {
    return new CsvFormatter<T>(config);
} 