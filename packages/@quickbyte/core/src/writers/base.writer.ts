import { DataFormat, DataSource } from '../types';

export interface WriterConfig {
    type: DataFormat | DataSource;
    options?: Record<string, unknown>;
}

export interface DataWriter<T> {
    write(data: T[], config: WriterConfig): Promise<void>;
    writeStream(data: AsyncIterable<T>, config: WriterConfig): Promise<void>;
} 