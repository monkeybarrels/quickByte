import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { DataWriter, WriterConfig } from './base.writer';
import { DataError, DataSource } from '../types';

export interface FileWriterConfig extends WriterConfig {
    options: {
        path: string;
        encoding?: BufferEncoding;
        append?: boolean;
    };
}

export class FileWriter<T> implements DataWriter<T> {
    constructor(private config: FileWriterConfig) {}

    async write(data: T[], config: WriterConfig): Promise<void> {
        try {
            const fileConfig = config.options as FileWriterConfig['options'];
            const content = JSON.stringify(data, null, 2);
            const flags = fileConfig.append ? 'a' : 'w';
            
            await fs.writeFile(fileConfig.path, content, {
                encoding: fileConfig.encoding || 'utf-8',
                flag: flags
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `File writing failed: ${error.message}`,
                    DataSource.FILE,
                    'WRITE_ERROR',
                    error
                );
            }
            throw new DataError(
                'File writing failed: Unknown error',
                DataSource.FILE,
                'WRITE_ERROR'
            );
        }
    }

    async writeStream(data: AsyncIterable<T>, config: WriterConfig): Promise<void> {
        try {
            const fileConfig = config.options as FileWriterConfig['options'];
            const flags = fileConfig.append ? 'a' : 'w';
            const writeStream = createWriteStream(fileConfig.path, {
                encoding: fileConfig.encoding || 'utf-8',
                flags
            });

            for await (const item of data) {
                const content = JSON.stringify(item) + '\n';
                writeStream.write(content);
            }

            writeStream.end();
        } catch (error) {
            if (error instanceof Error) {
                throw new DataError(
                    `File stream writing failed: ${error.message}`,
                    DataSource.FILE,
                    'WRITE_ERROR',
                    error
                );
            }
            throw new DataError(
                'File stream writing failed: Unknown error',
                DataSource.FILE,
                'WRITE_ERROR'
            );
        }
    }
}

export function createFileWriter<T>(config: FileWriterConfig): FileWriter<T> {
    return new FileWriter<T>(config);
} 