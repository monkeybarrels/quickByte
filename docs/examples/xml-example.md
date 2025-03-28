# XML Example

This example demonstrates how to use QuickByte's XML formatter to handle XML data, including formatting data to XML strings and parsing XML back into structured data.

## Overview

The example shows how to:
- Create an XML formatter with custom element names
- Format data structures to XML strings
- Parse XML strings back into typed data
- Handle XML operations with type safety

## Key Features

- Custom XML element naming
- Type-safe XML operations
- Flexible data structure
- Error handling
- Bidirectional conversion

## Complete Example

```typescript
import { XmlFormatter, createXmlFormatter } from '../src/data/formatters/xml.formatter';
import { FormatConfig, DataFormat } from '../src/data/types';

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
- Allows for additional fields in the XML data

### 2. XML Configuration

Set up XML formatter with custom element names:
```typescript
const xmlConfig = {
    rootElement: 'users',
    itemElement: 'user'
};
```

### 3. XML Formatter Creation

Create a type-safe XML formatter:
```typescript
const xmlFormatter = createXmlFormatter<User>(xmlConfig);
```

### 4. Data Formatting

Format data to XML string:
```typescript
const users: User[] = [
    { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' }
];

const xmlString = await xmlFormatter.format(users, formatConfig);
```

### 5. Data Parsing

Parse XML string back to typed data:
```typescript
const parsedUsers = await xmlFormatter.parse(xmlString, formatConfig);
```

## Running the Example

```bash
ts-node examples/xml-example.ts
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

## XML Output Format

The formatted XML will have this structure:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user>
    <id>1</id>
    <name>John Doe</name>
    <age>30</age>
    <email>john@example.com</email>
  </user>
  <user>
    <id>2</id>
    <name>Jane Smith</name>
    <age>25</age>
    <email>jane@example.com</email>
  </user>
</users>
```

## Error Handling

The example includes error handling:
```typescript
xmlExample().catch(error => {
    console.error('Error running XML example:', error);
});
```

## Best Practices Demonstrated

1. **Type Safety**: 
   - Interface definition with required fields
   - Generic type parameters
   - Flexible record type extension

2. **XML Formatting**:
   - Custom element naming
   - Consistent structure
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

- [JSON Example](./json-example.md)
- [API to JSON Example](./api-to-json.md)
- [CSV Example](./csv-example.md) 