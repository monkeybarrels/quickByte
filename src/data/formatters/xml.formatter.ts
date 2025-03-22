import { DataFormatter, XmlFormatterConfig, FormatConfig, DataError } from '../types';

export class XmlFormatter<T> implements DataFormatter<T, string> {
    private config: XmlFormatterConfig;

    constructor(config: XmlFormatterConfig) {
        this.config = config;
    }

    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            const items = data.map(item => {
                const properties = Object.entries(item as Record<string, unknown>)
                    .map(([key, value]) => `    <${key}>${value}</${key}>`)
                    .join('\n');
                return `  <${this.config.itemElement}>\n${properties}\n  </${this.config.itemElement}>`;
            }).join('\n');

            return `<?xml version="1.0" encoding="UTF-8"?>\n<${this.config.rootElement}>\n${items}\n</${this.config.rootElement}>`;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `XML formatting failed: ${error.message}`,
                    'file',
                    'FORMAT_ERROR',
                    error
                );
            }
            throw new DataError(
                'XML formatting failed: Unknown error',
                'file',
                'FORMAT_ERROR'
            );
        }
    }

    async parse(data: string, config: FormatConfig): Promise<T[]> {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/xml');
            const items = doc.getElementsByTagName(this.config.itemElement);
            const result: T[] = [];

            for (const item of items) {
                const obj: Record<string, string> = {};
                for (const child of item.children) {
                    obj[child.tagName] = child.textContent || '';
                }
                result.push(obj as T);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `XML parsing failed: ${error.message}`,
                    'file',
                    'PARSE_ERROR',
                    error
                );
            }
            throw new DataError(
                'XML parsing failed: Unknown error',
                'file',
                'PARSE_ERROR'
            );
        }
    }
}

export function createXmlFormatter<T>(config: XmlFormatterConfig): XmlFormatter<T> {
    return new XmlFormatter<T>(config);
} 