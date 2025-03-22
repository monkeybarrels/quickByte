# Data Readers

## File Reader

```typescript
import { createFileReader } from '../../src/data';

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

// Read data
const users = await reader.read({
    type: 'file',
    location: 'users.json'
});

// Read as stream
const stream = await reader.readStream({
    type: 'file',
    location: 'users.json'
});

for await (const user of stream) {
    console.log(user);
}
```

## API Reader

```typescript
import { createApiReader } from '../../src/data';

interface Post {
    id: number;
    title: string;
    body: string;
}

// Create an API reader
const reader = createApiReader<Post>({
    url: 'https://api.example.com/posts',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer token'
    }
});

// Read data
const posts = await reader.read({
    type: 'api',
    location: 'posts'
});
```

## Database Reader

```typescript
import { createDatabaseReader } from '../../src/data';

interface Product {
    id: number;
    name: string;
    price: number;
}

// Create a database reader
const reader = createDatabaseReader<Product>({
    table: 'products',
    connection: {
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'password'
    },
    query: 'SELECT * FROM products WHERE price > $1'
});

// Read data
const products = await reader.read({
    type: 'database',
    location: 'products'
}, [100]);

// Read as stream
const stream = await reader.readStream({
    type: 'database',
    location: 'products'
});

for await (const product of stream) {
    console.log(product);
}
```

## Stream Reader

```typescript
import { createStreamReader } from '../../src/data';
import { Readable } from 'stream';

interface Log {
    timestamp: string;
    level: string;
    message: string;
}

// Create a stream reader
const stream = new Readable({
    read() {
        this.push(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Test log'
        }) + '\n');
        this.push(null);
    }
});

const reader = createStreamReader<Log>({
    stream,
    encoding: 'utf-8'
});

// Read data
const logs = await reader.read({
    type: 'stream',
    location: 'logs'
});

// Read as stream
const logStream = await reader.readStream({
    type: 'stream',
    location: 'logs'
});

for await (const log of logStream) {
    console.log(log);
}
``` 