import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || 'localhost',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbyte'
}; 