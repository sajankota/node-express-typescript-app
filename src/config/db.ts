// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI =
            process.env.NODE_ENV === 'production'
                ? process.env.MONGO_URI_PROD
                : process.env.MONGO_URI_LOCAL;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in the environment variables.');
        }

        // Connect to MongoDB without deprecated options
        await mongoose.connect(mongoURI);

        console.log(`Connected to MongoDB (${process.env.NODE_ENV})`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;
