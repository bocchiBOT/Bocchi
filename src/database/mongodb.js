import { MongoClient } from 'mongodb';
import config from '../config.js';
import logger from '../utils/logger.js';

// Global variables for the connection
let client = null;
let db = null;
let isConnected = false;

export async function connectDB() {
    try {
        if (isConnected && db) {
            logger.debug('📊 MongoDB is already connected');
            return db;
        }

        const MONGO_URI = config.MongoClientOptions?.mongoURI || process.env.MONGO_URI;
        const DB_NAME = config.MongoClientOptions?.dbName || process.env.DB_NAME || 'baseDB';

        if (!MONGO_URI) {
            throw new Error('MONGO_URI not found in settings');
        }

        client = new MongoClient(MONGO_URI, {
            ...config.MongoClientOptions?.options
        });

        await client.connect();
        db = client.db(DB_NAME);
        
        // Test the connection
        await db.command({ ping: 1 });
        
        isConnected = true;
        
        logger.success(`✅ MongoDB connected successfully!`);
        logger.success(`📊 Database: ${db.databaseName}`);
        
        return db;

    } catch (error) {
        logger.error(`❌ Failed to connect to MongoDB: ${error.message}`);
        throw error;
    }
}


// Returns the database instance
 
export function getDB() {
    if (!isConnected || !db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db;
}


// Returns a specific collection

export function getCollection(collectionName) {
    if (!isConnected || !db) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return db.collection(collectionName);
}


// Close the connection

export async function closeDB() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        isConnected = false;
        logger.success('🔌 MongoDB connection closed successfully');
    }
}


// Connection status

export function getDBStatus() {
    return {
        connected: isConnected,
        database: db ? db.databaseName : null
    };
}
