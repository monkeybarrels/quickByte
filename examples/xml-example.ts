import { XmlFormatter, createXmlFormatter } from '../src/formatters/xml.formatter';
import { FormatConfig, DataFormat } from '../src/types';

interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}

async function xmlExample() {
    // XML Formatter Example
    const xmlConfig = {
        rootElement: 'users',
        itemElement: 'user'
    };
    
    const xmlFormatter = createXmlFormatter<User>(xmlConfig);
    const formatConfig: FormatConfig = { type: 'xml' as DataFormat };

    // Format data to XML
    const users: User[] = [
        { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ];
    
    const xmlString = await xmlFormatter.format(users, formatConfig);
    console.log('XML Output:', xmlString);

    // Parse XML back to data
    const parsedUsers = await xmlFormatter.parse(xmlString, formatConfig);
    console.log('Parsed Users:', parsedUsers);
}

// Run the example
xmlExample().catch(error => {
    console.error('Error running XML example:', error);
}); 