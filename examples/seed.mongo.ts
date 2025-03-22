import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'quickbyte';
const collectionName = 'products';

const sampleProducts = [
    {
        name: 'Laptop',
        price: 999.99,
        category: 'Electronics',
        inStock: true
    },
    {
        name: 'Headphones',
        price: 99.99,
        category: 'Electronics',
        inStock: true
    },
    {
        name: 'Mouse',
        price: 29.99,
        category: 'Electronics',
        inStock: false
    },
    {
        name: 'Keyboard',
        price: 79.99,
        category: 'Electronics',
        inStock: true
    }
];

async function seedDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Clear existing data
        await collection.deleteMany({});
        
        // Insert sample products
        const result = await collection.insertMany(sampleProducts);
        console.log(`Inserted ${result.insertedCount} products`);
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await client.close();
    }
}

seedDatabase(); 