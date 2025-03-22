# Data Formatters

## CSV Formatter

```typescript
import { createCsvFormatter } from '../../src/data';

interface User {
    id: number;
    name: string;
    email: string;
}

// Create a CSV formatter
const formatter = createCsvFormatter<User>({
    headers: ['id', 'name', 'email'],
    delimiter: ','
});

// Format data
const csv = await formatter.format([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
], { type: 'csv' });

// Parse data
const users = await formatter.parse(csv, { type: 'csv' });
```

## JSON Formatter

```typescript
import { createJsonFormatter } from '../../src/data';

interface Product {
    id: number;
    name: string;
    price: number;
}

// Create a JSON formatter
const formatter = createJsonFormatter<Product>({
    pretty: true
});

// Format data
const json = await formatter.format([
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 }
], { type: 'json' });

// Parse data
const products = await formatter.parse(json, { type: 'json' });
```

## XML Formatter

```typescript
import { createXmlFormatter } from '../../src/data';

interface Book {
    id: number;
    title: string;
    author: string;
}

// Create an XML formatter
const formatter = createXmlFormatter<Book>({
    rootElement: 'books',
    itemElement: 'book'
});

// Format data
const xml = await formatter.format([
    { id: 1, title: 'Book 1', author: 'Author 1' },
    { id: 2, title: 'Book 2', author: 'Author 2' }
], { type: 'xml' });

// Parse data
const books = await formatter.parse(xml, { type: 'xml' });
```

## Database Formatter

```typescript
import { createDatabaseFormatter } from '../../src/data';

interface Order {
    id: number;
    customerId: number;
    total: number;
}

// Create a database formatter
const formatter = createDatabaseFormatter<Order>({
    table: 'orders',
    connection: {
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'password'
    }
});

// Format data (insert into database)
await formatter.format([
    { id: 1, customerId: 100, total: 150 },
    { id: 2, customerId: 101, total: 200 }
], { type: 'database' });

// Parse data (read from database)
const orders = await formatter.parse(null, { type: 'database' });
``` 