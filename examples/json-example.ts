import { JsonFormatter, createJsonFormatter } from '../src/formatters/json.formatter';
import { FormatConfig, DataFormat } from '../src/types';

interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}

async function jsonExample() {
    // JSON Formatter Example
    const jsonFormatter = createJsonFormatter<User>();
    const formatConfig: FormatConfig = { 
        type: DataFormat.JSON,
        options: { pretty: true }
    };

    // Format data to JSON
    const users: User[] = [
        { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ];
    
    const jsonString = await jsonFormatter.format(users, formatConfig);
    console.log('JSON Output:', jsonString);

    // Parse JSON back to data
    const parsedUsers = await jsonFormatter.parse(jsonString, formatConfig);
    console.log('Parsed Users:', parsedUsers);
}

// Run the example
jsonExample().catch(error => {
    console.error('Error running JSON example:', error);
}); 