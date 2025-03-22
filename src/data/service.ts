import { DataService, DataReader, DataFormatter, SourceConfig, FormatConfig, DataError, DataServiceOptions } from './types';

export class DataServiceImpl<T, P = unknown, R = unknown> implements DataService<T, P, R> {
    constructor(
        public readonly reader: DataReader<T, P>,
        public readonly formatter: DataFormatter<T, R>,
        private options: DataServiceOptions<T> = {}
    ) {}

    async read(config: SourceConfig, format: FormatConfig, params?: P): Promise<R> {
        try {
            // Read data
            const data = await this.reader.read(config, params);

            // Apply transformations if any
            const transformedData = this.options.transform
                ? data.map(item => this.options.transform!(item))
                : data;

            // Apply validation if any
            if (this.options.validate) {
                for (const item of transformedData) {
                    if (!this.options.validate!(item)) {
                        throw new DataError(
                            'Data validation failed',
                            config.type,
                            'VALIDATION_ERROR'
                        );
                    }
                }
            }

            // Apply filtering if any
            const filteredData = this.options.filter
                ? transformedData.filter(item => this.options.filter!(item))
                : transformedData;

            // Format data
            return await this.formatter.format(filteredData, format);
        } catch (error: unknown) {
            if (error instanceof DataError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new DataError(
                    `Data service operation failed: ${error.message}`,
                    config.type,
                    'SERVICE_ERROR',
                    error
                );
            }
            throw new DataError(
                'Data service operation failed: Unknown error',
                config.type,
                'SERVICE_ERROR'
            );
        }
    }

    async readStream(config: SourceConfig, format: FormatConfig, params?: P): AsyncIterable<R> {
        if (!this.reader.readStream) {
            throw new DataError(
                'Stream reading not supported by this reader',
                config.type,
                'STREAM_NOT_SUPPORTED'
            );
        }

        const stream = this.reader.readStream(config, params);
        return {
            async *[Symbol.asyncIterator]() {
                for await (const item of stream) {
                    // Apply transformations if any
                    const transformedItem = this.options.transform
                        ? this.options.transform(item)
                        : item;

                    // Apply validation if any
                    if (this.options.validate && !this.options.validate(transformedItem)) {
                        throw new DataError(
                            'Data validation failed',
                            config.type,
                            'VALIDATION_ERROR'
                        );
                    }

                    // Apply filtering if any
                    if (this.options.filter && !this.options.filter(transformedItem)) {
                        continue;
                    }

                    // Format single item
                    yield await this.formatter.format([transformedItem], format) as R;
                }
            }
        };
    }
}

export function createDataService<T, P = unknown, R = unknown>(
    reader: DataReader<T, P>,
    formatter: DataFormatter<T, R>,
    options: DataServiceOptions<T> = {}
): DataService<T, P, R> {
    return new DataServiceImpl<T, P, R>(reader, formatter, options);
} 