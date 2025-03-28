# JSON Example

This example demonstrates how to use QuickByte's JSON formatter to handle JSON data, including formatting data to JSON strings and parsing JSON back into structured data.

## Overview

The example shows how to:
- Create a JSON formatter with pretty printing
- Format data structures to JSON strings
- Parse JSON strings back into typed data
- Handle JSON operations with type safety

## Key Features

- Pretty-printed JSON output
- Type-safe JSON operations
- Flexible data structure
- Error handling
- Bidirectional conversion

## Complete Example

```typescript
import { JsonFormatter, createJsonFormatter } from '../src/data/formatters/json.formatter';
import { FormatConfig, DataFormat } from '../src/data/types';

interface User extends Record<string, unknown> {
    id: string;
    name: string;
    age: number;
    email: string;
}

async function jsonExample() {
    // JSON Formatter Example
    const jsonFormatter = createJsonFormatter<User>({ pretty: true });
    const formatConfig: FormatConfig = { type: 'json' as DataFormat };

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
- Allows for additional fields in the JSON data

### 2. JSON Formatter Creation

Create a type-safe JSON formatter with pretty printing:
```typescript
const jsonFormatter = createJsonFormatter<User>({ pretty: true });
```

### 3. Data Formatting

Format data to JSON string:
```typescript
const users: User[] = [
    { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
];

const jsonString = await jsonFormatter.format(users, formatConfig);
```

### 4. Data Parsing

Parse JSON string back to typed data:
```typescript
const parsedUsers = await jsonFormatter.parse(jsonString, formatConfig);
```

## Running the Example

```bash
ts-node examples/json-example.ts
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

## JSON Output Format

The formatted JSON will have this structure:
```json
[
  {
    "id": "1",
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com"
  },
  {
    "id": "2",
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com"
  }
]
```

## Error Handling

The example includes error handling:
```typescript
jsonExample().catch(error => {
    console.error('Error running JSON example:', error);
});
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Interface definition with required fields
   - Generic type parameters
   - Flexible record type extension

2. **JSON Formatting**:
   - Pretty printing option
   - Consistent formatting
   - Type-safe serialization

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

- [API to JSON Example](./api-to-json.md)
- [Database Example](./database-example.md)
- [XML Example](./xml-example.md) 