import { DataFormatter, XmlFormatterConfig, FormatConfig, DataError } from '../types';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * A formatter class that handles XML data conversion.
 * This class can convert between JavaScript objects and XML strings, with support for
 * custom root and item element names.
 * 
 * @template T - The type of the data objects being formatted/parsed
 */
export class XmlFormatter<T extends Record<string, unknown>> implements DataFormatter<T, string> {
    private config: XmlFormatterConfig;

    /**
     * Creates a new XmlFormatter instance.
     * 
     * @param config - Configuration object specifying XML structure details
     * @param config.rootElement - The name of the root XML element
     * @param config.itemElement - The name of the XML element for each data item
     */
    constructor(config: XmlFormatterConfig) {
        this.config = config;
    }

    /**
     * Formats an array of objects into a pretty-printed XML string.
     * 
     * @param data - Array of objects to be converted to XML
     * @param config - Formatting configuration options
     * @returns Promise resolving to a formatted XML string
     * @throws {DataError} If XML formatting fails
     */
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

    /**
     * Parses an XML string into an array of objects.
     * 
     * @param data - XML string to be parsed
     * @param config - Parsing configuration options
     * @returns Promise resolving to an array of parsed objects
     * @throws {DataError} If XML parsing fails
     */
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

/**
 * Factory function to create a new XmlFormatter instance.
 * 
 * @template T - The type of the data objects being formatted/parsed
 * @param config - Configuration object specifying XML structure details
 * @returns A new XmlFormatter instance
 */
export function createXmlFormatter<T extends Record<string, unknown>>(config: XmlFormatterConfig): XmlFormatter<T> {
    return new XmlFormatter<T>(config);
} 