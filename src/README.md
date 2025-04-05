# Data Service System

A flexible and type-safe data service system for handling various data sources and formats.

## Quick Start

```typescript
// 1. Define your data type
interface User {
    id: number;
    name: string;
    email: string;
}

// 2. Create a file reader
const fileReader = createFileReader<User>({
    path: './data/users.csv',
    encoding: 'utf-8'
});

// 3. Create a CSV formatter
const csvFormatter = createCsvFormatter<User>({
    headers: ['id', 'name', 'email']
});

// 4. Create the service
const userService = new DataService<User>(fileReader, csvFormatter);

// 5. Use it!
const users = await userService.read();
```

## Common Use Cases

### Reading from a CSV File
```typescript
// Create a CSV file reader
const csvReader = createFileReader<User>({
    path: './data/users.csv',
    encoding: 'utf-8'
});

// Create a CSV formatter
const csvFormatter = createCsvFormatter<User>({
    headers: ['id', 'name', 'email']
});

// Create the service
const service = new DataService<User>(csvReader, csvFormatter);

// Read data
const users = await service.read();
```

### Reading from an API
```typescript
// Create an API reader
const apiReader = createApiReader<User>({
    url: 'https://api.example.com/users',
    headers: {
        'Authorization': 'Bearer token'
    }
});

// Create a JSON formatter
const jsonFormatter = createJsonFormatter<User>();

// Create the service
const service = new DataService<User>(apiReader, jsonFormatter);

// Read data
const users = await service.read();
```

### Reading from a Database
```typescript
// Create a database reader
const dbReader = createDatabaseReader<User>({
    table: 'users',
    connection: {
        host: 'localhost',
        port: 5432,
        database: 'mydb'
    }
});

// Create a database formatter
const dbFormatter = createDatabaseFormatter<User>();

// Create the service
const service = new DataService<User>(dbReader, dbFormatter);

// Read data
const users = await service.read();
```

## Available Readers

### File Reader
```typescript
const fileReader = createFileReader<User>({
    path: string;
    encoding?: string;
    delimiter?: string;
});
```

### API Reader
```typescript
const apiReader = createApiReader<User>({
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: unknown;
});
```

### Database Reader
```typescript
const dbReader = createDatabaseReader<User>({
    table: string;
    connection: DatabaseConnection;
    query?: string;
});
```

### Stream Reader
```typescript
const streamReader = createStreamReader<User>({
    stream: Readable;
    encoding?: string;
});
```

## Available Formatters

### CSV Formatter
```typescript
const csvFormatter = createCsvFormatter<User>({
    headers: string[];
    delimiter?: string;
});
```

### JSON Formatter
```typescript
const jsonFormatter = createJsonFormatter<User>({
    pretty?: boolean;
});
```

### XML Formatter
```typescript
const xmlFormatter = createXmlFormatter<User>({
    rootElement: string;
    itemElement: string;
});
```

### Database Formatter
```typescript
const dbFormatter = createDatabaseFormatter<User>({
    table: string;
});
```

## Advanced Usage

### Custom Reader
```typescript
const customReader = createCustomReader<User>({
    read: async (config) => {
        // Your custom reading logic here
        return data;
    }
});
```

### Custom Formatter
```typescript
const customFormatter = createCustomFormatter<User>({
    format: async (data) => {
        // Your custom formatting logic here
        return formattedData;
    },
    parse: async (data) => {
        // Your custom parsing logic here
        return parsedData;
    }
});
```

### With Transformations
```typescript
const service = new DataService<User>(reader, formatter, {
    transform: (user) => ({
        ...user,
        name: user.name.toUpperCase()
    })
});
```

### With Validation
```typescript
const service = new DataService<User>(reader, formatter, {
    validate: (user) => {
        if (!user.email.includes('@')) {
            throw new Error('Invalid email');
        }
        return true;
    }
});
```

## Error Handling

```typescript
try {
    const users = await service.read();
} catch (error) {
    if (error instanceof DataError) {
        console.error(`Error reading from ${error.source}:`, error.message);
    }
}
```

## Best Practices

1. **Choose the Right Reader**
   - Use `FileReader` for local files
   - Use `ApiReader` for HTTP endpoints
   - Use `DatabaseReader` for database access
   - Use `StreamReader` for streaming data

2. **Choose the Right Formatter**
   - Use `CsvFormatter` for CSV files
   - Use `JsonFormatter` for JSON data
   - Use `XmlFormatter` for XML data
   - Use `DatabaseFormatter` for database operations

3. **Add Transformations**
   - Transform data during reading
   - Transform data during formatting
   - Use the built-in transformation options

4. **Add Validation**
   - Validate data during reading
   - Validate data during formatting
   - Use the built-in validation options

## Future Improvements

1. Add more reader types (Redis, MongoDB, etc.)
2. Add more formatter types (YAML, Excel, etc.)
3. Add compression support
4. Add encryption support
5. Add caching support
6. Add retry mechanisms
7. Add rate limiting
8. Add monitoring and metrics 