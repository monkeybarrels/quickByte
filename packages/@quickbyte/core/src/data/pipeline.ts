import { DataReader, DataWriter, DataFormatter, DataError, DataSource, DataFormat } from '../types';

export class Pipeline<T = unknown> {
    private readers: DataReader<T>[] = [];
    private writers: DataWriter<T>[] = [];
    private formatters: DataFormatter<T>[] = [];

    addReader(reader: DataReader<T>): this {
        this.readers.push(reader);
        return this;
    }

    addWriter(writer: DataWriter<T>): this {
        this.writers.push(writer);
        return this;
    }

    addFormatter(formatter: DataFormatter<T>): this {
        this.formatters.push(formatter);
        return this;
    }

    async execute(): Promise<void> {
        try {
            // Read data from all readers
            const data = await Promise.all(
                this.readers.map(reader => reader.read({ type: DataSource.FILE, location: '' }))
            );

            // Flatten the data array
            const flattenedData = data.flat() as T[];

            // Apply formatters if any
            let transformedData = flattenedData;
            for (const formatter of this.formatters) {
                transformedData = (await formatter.format(transformedData, { type: DataFormat.JSON })) as T[];
            }

            // Write data using all writers
            await Promise.all(
                this.writers.map(writer => writer.write(transformedData, { type: DataSource.FILE, location: '' }))
            );
        } catch (error) {
            if (error instanceof DataError) {
                throw error;
            }
            throw new DataError(
                'Pipeline execution failed',
                DataSource.PIPELINE,
                'PIPELINE_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }
} 