import { DatabaseFormatter, createDatabaseFormatter } from '../src/formatters/database.formatter';
import { FormatConfig, DataFormat } from '../src/types';

interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}

async function databaseExample() {
    // Database Formatter Example
    const dbConfig = {
        table: 'users',
        connection: {
            host: 'localhost',
            port: 5432,
            database: 'mydb',
            username: 'user',
            password: 'password',
            ssl: false
        }
    };
    
    const dbFormatter = createDatabaseFormatter<User>(dbConfig);
    const formatConfig: FormatConfig = { type: 'json' as DataFormat };

    // Format data to database
    const users: User[] = [
        { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ];
    
    await dbFormatter.format(users, formatConfig);

    // Parse data from database
    const parsedUsers = await dbFormatter.parse(undefined, formatConfig);
    console.log('Database Users:', parsedUsers);
}

// Run the example
databaseExample().catch(error => {
    console.error('Error running database example:', error);
}); 