# Data Service

## Basic Usage

```typescript
import { createDataService, createFileReader, createJsonFormatter } from '../../src/data';

interface User {
    id: number;
    name: string;
    email: string;
}

// Create a service
const service = createDataService<User>(
    createFileReader<User>({
        path: './data/users.json',
        encoding: 'utf-8'
    }),
    createJsonFormatter<User>()
);

// Read data
const users = await service.read(
    { type: 'file', location: 'users.json' },
    { type: 'json' }
);
```

## With Transformations

```typescript
import { createDataService, createApiReader, createCsvFormatter } from '../../src/data';

interface Product {
    id: number;
    name: string;
    price: number;
}

// Create a service with transformations
const service = createDataService<Product>(
    createApiReader<Product>({
        url: 'https://api.example.com/products'
    }),
    createCsvFormatter<Product>({
        headers: ['id', 'name', 'price']
    }),
    {
        transform: (product) => ({
            ...product,
            name: product.name.toUpperCase(),
            price: product.price * 1.1 // Add 10% VAT
        })
    }
);

// Read transformed data
const products = await service.read(
    { type: 'api', location: 'products' },
    { type: 'csv' }
);
```

## With Validation

```typescript
import { createDataService, createDatabaseReader, createJsonFormatter } from '../../src/data';

interface Order {
    id: number;
    customerId: number;
    total: number;
}

// Create a service with validation
const service = createDataService<Order>(
    createDatabaseReader<Order>({
        table: 'orders',
        connection: {
            host: 'localhost',
            port: 5432,
            database: 'mydb'
        }
    }),
    createJsonFormatter<Order>(),
    {
        validate: (order) => {
            if (order.total < 0) {
                throw new Error('Order total cannot be negative');
            }
            return true;
        }
    }
);

// Read validated data
const orders = await service.read(
    { type: 'database', location: 'orders' },
    { type: 'json' }
);
```

## With Filtering

```typescript
import { createDataService, createFileReader, createXmlFormatter } from '../../src/data';

interface Log {
    timestamp: string;
    level: string;
    message: string;
}

// Create a service with filtering
const service = createDataService<Log>(
    createFileReader<Log>({
        path: './data/logs.json'
    }),
    createXmlFormatter<Log>({
        rootElement: 'logs',
        itemElement: 'log'
    }),
    {
        filter: (log) => log.level === 'error'
    }
);

// Read filtered data
const errorLogs = await service.read(
    { type: 'file', location: 'logs.json' },
    { type: 'xml' }
);
```

## With Streaming

```typescript
import { createDataService, createStreamReader, createJsonFormatter } from '../../src/data';
import { Readable } from 'stream';

interface Event {
    id: number;
    type: string;
    data: unknown;
}

// Create a service with streaming
const stream = new Readable({
    read() {
        this.push(JSON.stringify({
            id: 1,
            type: 'user.created',
            data: { userId: 123 }
        }) + '\n');
        this.push(null);
    }
});

const service = createDataService<Event>(
    createStreamReader<Event>({ stream }),
    createJsonFormatter<Event>()
);

// Read stream
const eventStream = await service.readStream(
    { type: 'stream', location: 'events' },
    { type: 'json' }
);

for await (const event of eventStream) {
    console.log(event);
}
``` 