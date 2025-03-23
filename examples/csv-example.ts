import { CsvFormatter, createCsvFormatter } from '../src/data/formatters/csv.formatter';
import { FormatConfig, DataFormat } from '../src/data/types';

interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}

async function csvExample() {
    // CSV Formatter Example
    const csvConfig = {
        headers: ['id', 'name', 'age', 'email'],
        delimiter: ','
    };
    
    const formatConfig: FormatConfig = {
        type: 'csv' as DataFormat,
        options: csvConfig as unknown as Record<string, unknown>
    };
    
    const csvFormatter = createCsvFormatter<User>(formatConfig);

    // Format data to CSV
    const users: User[] = [
        { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ];
    
    const csvString = await csvFormatter.format(users, formatConfig);
    console.log('CSV Output:', csvString);

    // Parse CSV back to data
    const parsedUsers = await csvFormatter.parse(csvString, formatConfig);
    console.log('Parsed Users:', parsedUsers);
}

// Run the example
csvExample().catch(error => {
    console.error('Error running CSV example:', error);
}); 