// src/models/userModel.ts

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['free_user', 'paid_user', 'admin', 'super_admin'],
            default: 'free_user',
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
            default: 5,
        },
        lastReportReset: {
            type: Date,
            default: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
    },
    { timestamps: true }
);

// Pre-save hook to set the report limit based on the user's role
userSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('role')) {
        switch (this.role) {
            case 'paid_user':
                this.reportLimit = 20;
                break;
            case 'admin':
                this.reportLimit = 100;
                break;
            case 'super_admin':
                this.reportLimit = 1000;
                break;
            default:
                this.reportLimit = 5;
                break;
        }
    }

    next();
});

export const User = mongoose.model('User', userSchema);
