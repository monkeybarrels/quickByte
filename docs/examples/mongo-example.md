# MongoDB Basic Operations Example

This example demonstrates basic MongoDB operations using QuickByte, including connection, CRUD operations, and data validation.

## Overview

The example shows how to connect to MongoDB, perform basic CRUD operations, and handle data validation using QuickByte's MongoDB integration.

## Key Features

- MongoDB connection management
- Basic CRUD operations
- Data validation
- Error handling
- Type safety

## Code Example

```typescript
// Define the data type
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// Create MongoDB reader
const mongoReader = createMongoReader<User>({
  type: DataSource.MONGODB,
  options: {
    uri: 'mongodb://localhost:27017',
    database: 'quickbyte',
    collection: 'users'
  }
});

// Create MongoDB writer
const mongoWriter = createMongoWriter<User>({
  type: DataSource.MONGODB,
  options: {
    uri: 'mongodb://localhost:27017',
    database: 'quickbyte',
    collection: 'users'
  }
});

// Create validation transformer
const validationTransformer = createFilterTransformer<User>({
  name: 'userValidation',
  description: 'Validates user data',
  field: 'email',
  operator: FilterOperator.CONTAINS,
  value: '@',
  predicate: (user) => 
    user.email.includes('@') && 
    user.age >= 0 && 
    user.name.length > 0
});

// Example CRUD operations
async function performCrudOperations() {
  try {
    // Create a new user
    const newUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      createdAt: new Date()
    };

    // Insert user
    await mongoWriter.write([newUser], {
      type: DataSource.MONGODB,
      options: {
        operation: 'insert'
      }
    });

    // Read users
    const users = await mongoReader.read({
      type: DataSource.MONGODB,
      options: {
        query: { age: { $gte: 25 } }
      }
    });

    // Update user
    const updatedUser = {
      ...newUser,
      age: 31
    };

    await mongoWriter.write([updatedUser], {
      type: DataSource.MONGODB,
      options: {
        operation: 'update',
        query: { id: '1' }
      }
    });

    // Delete user
    await mongoWriter.write([{ id: '1' }], {
      type: DataSource.MONGODB,
      options: {
        operation: 'delete',
        query: { id: '1' }
      }
    });

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## How It Works

1. **Connection Setup**: 
   - Configures MongoDB connection using URI
   - Specifies database and collection names

2. **Data Operations**:
   - **Create**: Inserts new documents
   - **Read**: Queries documents with filters
   - **Update**: Modifies existing documents
   - **Delete**: Removes documents

3. **Validation**:
   - Validates email format
   - Checks age constraints
   - Ensures name is not empty

## Running the Example

```bash
ts-node examples/mongo.example.ts
```

## Prerequisites

1. MongoDB server running locally or accessible via URI
2. Required environment variables or configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DATABASE=quickbyte
   MONGODB_COLLECTION=users
   ```

## Data Structure

Example document structure:
```json
{
  "id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "createdAt": "2024-03-28T12:00:00Z"
}
```

## Error Handling

The example includes comprehensive error handling:
```typescript
try {
  // Operation code
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

## Best Practices Demonstrated

1. **Type Safety**: Interface definition for data structure
2. **Connection Management**: Proper connection handling
3. **Validation**: Data validation before operations
4. **Error Handling**: Comprehensive error catching
5. **Configuration**: Flexible connection options

## See Also

- [MongoDB to CSV Example](./mongo-to-csv.md)
- [CSV to MongoDB Example](./csv-to-mongo.md)
- [MongoDB Seeding Example](./seed-mongo.md) 