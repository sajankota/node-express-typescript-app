// src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { User } from "../models/userModel";
import { sendEmail } from "../services/emailService";
import {
  validatePassword,
  createWelcomeEmail,
  createPasswordResetEmail,
  createPasswordResetConfirmationEmail,
} from "../utils/authUtils";

const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.roundcodebox.com";

// Helper to handle validation errors
const handleValidationError = (res: Response, message: string): void => {
  res.status(400).json({ message });
};

// Register User Function
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return handleValidationError(res, "All fields are required");
    }

    if (password !== confirmPassword) {
      return handleValidationError(res, "Passwords do not match");
    }

    if (!validatePassword(password)) {
      return handleValidationError(
        res,
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
      );
    }

    const [existingUser, userCount] = await Promise.all([
      User.findOne({ email }).lean(),
      User.countDocuments(),
    ]);

    if (existingUser) {
      return handleValidationError(res, "User already exists");
    }

    const userRole = userCount === 0 ? "super_admin" : role || "user";
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    await sendEmail(email, "Welcome to RoundCodeBox!", createWelcomeEmail(username));

    res.status(201).json({
      token,
      user: { userId: newUser._id, username, email, role: newUser.role },
    });
  } catch (error) {
    console.error("[Register User Error]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User Function
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleValidationError(res, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Login User Error]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot Password Function
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return handleValidationError(res, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "No account found with this email" });
      return;
    }

    const resetToken = randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail(email, "Password Reset Request", createPasswordResetEmail(resetLink));

    res.status(200).json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password Function
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, confirmPassword, token, email } = req.body;

    if (!password || !confirmPassword || !token || !email) {
      return handleValidationError(res, "All fields are required");
    }

    if (password !== confirmPassword) {
      return handleValidationError(res, "Passwords do not match");
    }

    if (!validatePassword(password)) {
      return handleValidationError(
        res,
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character"
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "No account found with this email" });
      return;
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken || "");
    if (!isTokenValid || (user.passwordResetExpires && user.passwordResetExpires < new Date())) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await sendEmail(email, "Password Reset Confirmation", createPasswordResetConfirmationEmail());

    res.status(200).json({ message: "Your password has been reset successfully" });
  } catch (error) {
    console.error("[Reset Password Error]", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout User Function
export const logoutUser = (req: Request, res: Response): void => {
  res.status(200).json({ message: "Logged out successfully" });
};
