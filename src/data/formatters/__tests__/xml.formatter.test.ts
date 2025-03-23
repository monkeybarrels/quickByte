import { XmlFormatter, createXmlFormatter } from '../xml.formatter';
import { XmlFormatterConfig, FormatConfig, DataError, DataFormat } from '../../types';

interface TestData extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
}

describe('XmlFormatter', () => {
    const xmlConfig: XmlFormatterConfig = {
        rootElement: 'users',
        itemElement: 'user'
    };

    const formatConfig: FormatConfig = {
        type: DataFormat.XML,
        options: xmlConfig as unknown as Record<string, unknown>
    };

    const testData: TestData[] = [
        { id: '1', name: 'John Doe', age: 30 },
        { id: '2', name: 'Jane Smith', age: 25 }
    ];

    const expectedXml = `<?xml version="1.0" encoding="UTF-8"?>
<users name="users">
  <user id="1" name="John Doe" age="30"/>
  <user id="2" name="Jane Smith" age="25"/>
</users>`;

    beforeEach(() => {
        // ... existing code ...
    });

    describe('format', () => {
        it('should handle empty data array', async () => {
            const formatter = new XmlFormatter<TestData>(xmlConfig);
            const result = await formatter.format([], formatConfig);
            expect(result).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<users name="users"/>\n');
        });

        it('should throw DataError on invalid data', async () => {
            const formatter = new XmlFormatter<TestData>(xmlConfig);
            const invalidData = [{ id: '1', name: 'John', age: null }] as unknown as TestData[];
            
            await expect(formatter.format(invalidData, formatConfig))
                .rejects
                .toThrow(DataError);
        });
    });

    describe('parse', () => {
        it('should parse XML string to data array', async () => {
            const formatter = new XmlFormatter<TestData>(xmlConfig);
            const result = await formatter.parse(expectedXml, formatConfig);
            expect(result).toEqual(testData);
        });

        it('should handle empty XML', async () => {
            const formatter = new XmlFormatter<TestData>(xmlConfig);
            const emptyXml = '<?xml version="1.0" encoding="UTF-8"?>\n<users name="users"/>\n';
            const result = await formatter.parse(emptyXml, formatConfig);
            expect(result).toEqual([]);
        });

        it('should throw DataError on invalid XML', async () => {
            const formatter = new XmlFormatter<TestData>(xmlConfig);
            const invalidXml = '<invalid>xml</invalid>';
            
            await expect(formatter.parse(invalidXml, formatConfig))
                .rejects
                .toThrow(DataError);
        });
    });

    describe('createXmlFormatter', () => {
        it('should create a new XmlFormatter instance', () => {
            const formatter = createXmlFormatter<TestData>(xmlConfig);
            expect(formatter).toBeInstanceOf(XmlFormatter);
        });
    });
}); 