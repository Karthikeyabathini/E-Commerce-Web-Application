const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
  
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    // Connect to URI with 3 seconds timeout
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If connection is localhost/127.0.0.1, try in-memory database fallback
    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1') || mongoUri.includes('[::1]')) {
      console.log('Local MongoDB server not reachable. Attempting in-memory fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        console.log(`In-memory database server started at URI: ${inMemoryUri}`);
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
        
        // Track that we are using in-memory DB
        global.isInMemoryDB = true;
        return conn;
      } catch (fallbackError) {
        console.error('In-memory MongoDB fallback failed. Verify library installation.');
        console.error(fallbackError.message);
        console.error(`Original Connection Error: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('In-memory MongoDB stopped.');
    }
  } catch (err) {
    console.error(`Error disconnecting database: ${err.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
