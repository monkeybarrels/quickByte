import { DataFormatter, XmlFormatterConfig, FormatConfig, DataError } from '../types';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class XmlFormatter<T extends Record<string, unknown>> implements DataFormatter<T, string> {
    private config: XmlFormatterConfig;

    constructor(config: XmlFormatterConfig) {
        this.config = config;
    }

    async format(data: T[], config: FormatConfig): Promise<string> {
        try {
            const doc = new DOMParser().parseFromString(`<${this.config.rootElement}/>`, 'text/xml');
            const root = doc.documentElement;
            if (!root) {
                throw new Error('Failed to create XML document');
            }
            root.setAttribute('name', this.config.rootElement);

            for (const item of data) {
                const element = doc.createElement(this.config.itemElement);
                for (const [key, value] of Object.entries(item)) {
                    if (value === null) {
                        throw new Error(`Invalid null value for attribute: ${key}`);
                    }
                    element.setAttribute(key, String(value));
                }
                root.appendChild(element);
            }

            const serializer = new XMLSerializer();
            const xmlString = serializer.serializeToString(doc);
            const prettyXml = xmlString
                .replace(/></g, '>\n  <')
                .replace(/\/>/g, '/>\n')
                .replace(/\n\s*\n/g, '\n')
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + prettyXml;
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
            if (!doc.documentElement || doc.documentElement.tagName !== this.config.rootElement) {
                throw new Error(`Invalid XML structure: expected root element '${this.config.rootElement}'`);
            }
            const items = doc.getElementsByTagName(this.config.itemElement);
            const result: T[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const obj: Record<string, unknown> = {};
                for (let j = 0; j < item.attributes.length; j++) {
                    const attr = item.attributes[j];
                    const value = attr.value;
                    obj[attr.name] = attr.name === 'age' ? Number(value) : value;
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