// src/models/userModel.ts

// src/models/userModel.ts

import mongoose, { Document } from 'mongoose';

// Define the User interface for TypeScript
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin' | 'super_admin';
    subscriptionType: 'free' | 'paid';
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    monthlyReportCount: number;
    reportLimit: number;
    lastReportReset: Date;
}

// User Schema definition
const userSchema = new mongoose.Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['user', 'admin', 'super_admin'],
            default: 'user',
        },
        subscriptionType: {
            type: String,
            enum: ['free', 'paid'],
            default: 'free',
        },
        passwordResetToken: { type: String },
        passwordResetExpires: { type: Date },
        monthlyReportCount: {
            type: Number,
            default: 0,
        },
        reportLimit: {
            type: Number,
            default: function (this: IUser) {
                // Set report limits based on role and subscription type
                if (this.role === 'admin') return 100;
                if (this.role === 'super_admin') return 1000;
                return this.subscriptionType === 'paid' ? 20 : 5;
            },
        },
        lastReportReset: {
            type: Date,
            default: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
    },
    { timestamps: true }
);

// Middleware to reset the monthly report count if the month has changed
userSchema.pre<IUser>('save', function (next) {
    const currentMonth = new Date().getMonth();
    const lastResetMonth = this.lastReportReset.getMonth();

    if (currentMonth !== lastResetMonth) {
        this.monthlyReportCount = 0;
        this.lastReportReset = new Date(new Date().getFullYear(), currentMonth, 1);
    }
    next();
});

export const User = mongoose.model<IUser>('User', userSchema);
