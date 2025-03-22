# QuickByte Data Service Documentation

This documentation provides examples and usage patterns for the QuickByte data service system.

## Table of Contents

1. [Core Concepts](./core/README.md)
2. [Readers](./readers/README.md)
3. [Formatters](./formatters/README.md)
4. [Service](./service/README.md)
5. [Examples](./examples/README.md)

## Quick Start

```typescript
import { createDataService, createFileReader, createJsonFormatter } from '../src/data';

// Define your data type
interface User {
    id: number;
    name: string;
    email: string;
}

// Create a file reader
const reader = createFileReader<User>({
    path: './data/users.json',
    encoding: 'utf-8'
});

// Create a JSON formatter
const formatter = createJsonFormatter<User>({
    pretty: true
});

// Create the service
const service = createDataService<User>(reader, formatter);

// Use it!
const users = await service.read(
    { type: 'file', location: 'users.json' },
    { type: 'json' }
);
```

## Installation

```bash
npm install quickbyte
```

## TypeScript Support

The library is written in TypeScript and includes type definitions. No additional type packages are needed.

## License

MIT 