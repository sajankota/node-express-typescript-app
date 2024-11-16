// src/models/userModel.ts

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['user', 'admin', 'editor', 'super_admin'],
            default: 'user',
            required: true,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
