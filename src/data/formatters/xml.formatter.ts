import { DataFormatter, XmlFormatterConfig, FormatConfig, DataError } from '../types';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class XmlFormatter<T extends Record<string, unknown>> implements DataFormatter<T, string> {
    private config: XmlFormatterConfig;

    constructor(config: XmlFormatterConfig) {
        this.config = config;
    }

    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
            const root = doc.documentElement;
            if (!root) {
                throw new Error('Failed to create XML document');
            }
            root.setAttribute('name', this.config.rootElement);

            for (const item of data) {
                const element = doc.createElement(this.config.itemElement);
                for (const [key, value] of Object.entries(item)) {
                    element.setAttribute(key, String(value));
                }
                root.appendChild(element);
            }

            return new XMLSerializer().serializeToString(doc);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `XML formatting failed: ${error.message}`,
                    'xml',
                    'XML_FORMAT_ERROR',
                    error
                );
            }
            throw new DataError(
                'XML formatting failed: Unknown error',
                'xml',
                'XML_FORMAT_ERROR'
            );
        }
    }

    async parse(data: string, config: FormatConfig): Promise<T[]> {
        try {
            const doc = new DOMParser().parseFromString(data, 'text/xml');
            const items = doc.getElementsByTagName(this.config.itemElement);
            const result: T[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const obj: Record<string, unknown> = {};
                for (let j = 0; j < item.attributes.length; j++) {
                    const attr = item.attributes[j];
                    obj[attr.name] = attr.value;
                }
                result.push(obj as T);
            }

            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DataError(
                    `XML parsing failed: ${error.message}`,
                    'xml',
                    'XML_PARSE_ERROR',
                    error
                );
            }
            throw new DataError(
                'XML parsing failed: Unknown error',
                'xml',
                'XML_PARSE_ERROR'
            );
        }
    }
}

export function createXmlFormatter<T extends Record<string, unknown>>(config: XmlFormatterConfig): XmlFormatter<T> {
    return new XmlFormatter<T>(config);
} 