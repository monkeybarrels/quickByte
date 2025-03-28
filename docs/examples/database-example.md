# Database Example

This example demonstrates how to use QuickByte's database formatter to interact with a database, including formatting data for database storage and parsing data from the database.

## Overview

The example shows how to:
- Configure database connection settings
- Format data for database storage
- Parse data from the database
- Handle database operations with type safety

## Key Features

- Database connection configuration
- Type-safe database operations
- Data formatting and parsing
- Error handling
- Flexible data structure

## Complete Example

```typescript
import { DatabaseFormatter, createDatabaseFormatter } from '../src/data/formatters/database.formatter';
import { FormatConfig, DataFormat } from '../src/data/types';

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
```

## How It Works

### 1. Data Type Definition

The example defines a flexible interface for user data:
```typescript
interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}
```

This interface:
- Extends `Record<string, unknown>` for additional flexibility
- Defines required fields with specific types
- Allows for additional fields in the database

### 2. Database Configuration

Set up database connection details:
```typescript
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
```

### 3. Database Formatter Creation

Create a type-safe database formatter:
```typescript
const dbFormatter = createDatabaseFormatter<User>(dbConfig);
```

### 4. Data Formatting

Format data for database storage:
```typescript
const users: User[] = [
    { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
];

await dbFormatter.format(users, formatConfig);
```

### 5. Data Parsing

Retrieve and parse data from the database:
```typescript
const parsedUsers = await dbFormatter.parse(undefined, formatConfig);
```

## Running the Example

```bash
ts-node examples/database-example.ts
```

## Input Format

The input data should have this structure:
```typescript
{
    id: string;
    name: string;
    age: number;
    email: string;
    [key: string]: unknown;  // Additional fields allowed
}
```

## Database Table Structure

The database table should have this structure:
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL
);
```

## Error Handling

The example includes error handling:
```typescript
databaseExample().catch(error => {
    console.error('Error running database example:', error);
});
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Interface definition with required fields
   - Generic type parameters
   - Flexible record type extension

2. **Database Configuration**:
   - Connection details management
   - Table specification
   - SSL configuration option

3. **Data Handling**:
   - Type-safe data formatting
   - Structured data parsing
   - Flexible data structure

4. **Error Handling**:
   - Promise error catching
   - Error logging
   - Graceful error propagation

5. **Code Organization**:
   - Clear interface definition
   - Modular configuration
   - Separation of concerns

## See Also

- [MongoDB Example](./mongo.example.md)
- [CSV to MongoDB Example](./csv-to-mongo.md)
- [MongoDB to CSV Example](./mongo-to-csv.md) 