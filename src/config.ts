export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/quickbyte'
}; 