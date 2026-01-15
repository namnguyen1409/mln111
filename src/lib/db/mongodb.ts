import mongoose from 'mongoose';

// Pre-register models to prevent MissingSchemaError in Next.js Serverless
import '@/models/User';
import '@/models/BattleSession';
import '@/models/Topic';
import '@/models/Quiz';
import '@/models/PointHistory';
import '@/models/Achievement';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:1409@localhost:27018/mln111?authSource=admin';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Recommended for Serverless to avoid exhausting DB connections
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
