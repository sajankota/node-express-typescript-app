// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Use a single environment variable for MongoDB URI
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in the environment variables.');
        }

        // Connect to MongoDB without deprecated options
        await mongoose.connect(mongoURI);

        console.log('Connected to Database');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;
