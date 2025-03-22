# Examples

## User Management System

```typescript
import { createDataService, createFileReader, createJsonFormatter } from '../../src/data';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
}

// Create a service for user management
const userService = createDataService<User>(
    createFileReader<User>({
        path: './data/users.json'
    }),
    createJsonFormatter<User>({
        pretty: true
    }),
    {
        validate: (user) => {
            if (!user.email.includes('@')) {
                throw new Error('Invalid email address');
            }
            return true;
        }
    }
);

// Read all users
const users = await userService.read(
    { type: 'file', location: 'users.json' },
    { type: 'json' }
);

// Filter admin users
const adminService = createDataService<User>(
    userService.reader,
    userService.formatter,
    {
        filter: (user) => user.role === 'admin'
    }
);

const admins = await adminService.read(
    { type: 'file', location: 'users.json' },
    { type: 'json' }
);
```

## Product Catalog

```typescript
import { createDataService, createDatabaseReader, createCsvFormatter } from '../../src/data';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
}

// Create a service for product catalog
const productService = createDataService<Product>(
    createDatabaseReader<Product>({
        table: 'products',
        connection: {
            host: 'localhost',
            port: 5432,
            database: 'catalog'
        }
    }),
    createCsvFormatter<Product>({
        headers: ['id', 'name', 'description', 'price', 'category', 'stock'],
        delimiter: ','
    }),
    {
        transform: (product) => ({
            ...product,
            price: Number(product.price.toFixed(2)),
            stock: Math.max(0, product.stock)
        })
    }
);

// Export products to CSV
const csv = await productService.read(
    { type: 'database', location: 'products' },
    { type: 'csv' }
);

// Filter low stock products
const lowStockService = createDataService<Product>(
    productService.reader,
    productService.formatter,
    {
        filter: (product) => product.stock < 10
    }
);

const lowStockProducts = await lowStockService.read(
    { type: 'database', location: 'products' },
    { type: 'csv' }
);
```

## Log Analysis

```typescript
import { createDataService, createStreamReader, createXmlFormatter } from '../../src/data';
import { Readable } from 'stream';

interface LogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    service: string;
    message: string;
    metadata?: Record<string, unknown>;
}

// Create a service for log analysis
const logService = createDataService<LogEntry>(
    createStreamReader<LogEntry>({
        stream: process.stdin,
        encoding: 'utf-8'
    }),
    createXmlFormatter<LogEntry>({
        rootElement: 'logs',
        itemElement: 'log'
    }),
    {
        validate: (log) => {
            if (!['info', 'warn', 'error'].includes(log.level)) {
                throw new Error('Invalid log level');
            }
            return true;
        }
    }
);

// Process logs in real-time
const errorStream = await logService.readStream(
    { type: 'stream', location: 'logs' },
    { type: 'xml' }
);

for await (const log of errorStream) {
    if (log.level === 'error') {
        console.error(`[${log.timestamp}] ${log.service}: ${log.message}`);
    }
}
```

## Order Processing

```typescript
import { createDataService, createApiReader, createDatabaseFormatter } from '../../src/data';

interface Order {
    id: number;
    customerId: number;
    items: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}

// Create a service for order processing
const orderService = createDataService<Order>(
    createApiReader<Order>({
        url: 'https://api.example.com/orders',
        headers: {
            'Authorization': 'Bearer token'
        }
    }),
    createDatabaseFormatter<Order>({
        table: 'orders',
        connection: {
            host: 'localhost',
            port: 5432,
            database: 'orders'
        }
    }),
    {
        transform: (order) => ({
            ...order,
            total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        }),
        validate: (order) => {
            if (order.total <= 0) {
                throw new Error('Invalid order total');
            }
            return true;
        }
    }
);

// Process orders
const orders = await orderService.read(
    { type: 'api', location: 'orders' },
    { type: 'database' }
);
``` 