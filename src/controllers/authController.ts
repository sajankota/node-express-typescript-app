// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { User } from '../models/userModel';
import { sendEmail } from '../services/emailService';

// Register User Function

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    // Validate input fields
    if (!username || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    const passwordStrengthRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Check if this is the first user in the system
    const isFirstUser = (await User.countDocuments()) === 0;

    // Set role based on whether this is the first user
    const userRole = isFirstUser ? 'super_admin' : role || 'user';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Construct a professional registration email template
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="text-align: center; padding-bottom: 20px;">
          <img src="https://www.roundcodebox.com/logo.png" alt="RoundCodeBox Logo" style="width: 150px; max-width: 100%;">
        </div>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007BFF;">Welcome to RoundCodeBox, ${username}!</h2>
          <p style="font-size: 16px; color: #555;">Hi ${username},</p>
          <p style="font-size: 16px; color: #555;">
            We are thrilled to have you join our community! Thank you for registering with RoundCodeBox. You now have access to all the features of our platform.
          </p>
          <h3 style="color: #007BFF;">Get Started</h3>
          <p style="font-size: 16px; color: #555;">
            Click the button below to log in and explore:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://www.roundcodebox.com/login" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">Log In to Your Account</a>
          </div>
          <p style="font-size: 16px; color: #555;">
            If you did not create this account, please ignore this email or <a href="https://www.roundcodebox.com/contact" style="color: #007BFF;">contact our support team</a>.
          </p>
        </div>
        <div style="margin-top: 20px; padding: 10px 0; text-align: center; font-size: 14px; color: #888;">
          <p style="margin: 0;">Need help? <a href="mailto:support@roundcodebox.com" style="color: #007BFF;">Email our support team</a></p>
          <p style="margin: 0;">&copy; 2024 RoundCodeBox, Inc. All rights reserved.</p>
          <p style="margin: 0;">123 Main Street, Anytown, USA</p>
          <p style="margin: 0;"><a href="https://www.roundcodebox.com/unsubscribe" style="color: #007BFF;">Unsubscribe</a></p>
        </div>
      </div>
    `;

    // Send the registration email
    await sendEmail(email, 'Welcome to RoundCodeBox!', emailContent);

    // Respond with token and user info
    res.status(201).json({ token, user: { username, email, role: newUser.role } });
  } catch (error) {
    console.error('[Register User Error]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User Function

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log('[Login Request]', req.body);

  try {
    const { email, password } = req.body;

    console.log('[Login Input Check] Email:', email, 'Password:', password ? 'Provided' : 'Not Provided');

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    console.log('[User Lookup]', user ? `User found: ${user.email}` : 'User not found');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Log the stored hashed password for debugging
    console.log('[Stored Hashed Password]', user.password);

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[Password Comparison]', isPasswordValid ? 'Password is valid' : 'Invalid password');

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
    console.log('[Login Successful]', user.username);
  } catch (error) {
    console.error('[Login User Error]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout User Function

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear token or session data if needed (client-side typically handles this)
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout Error]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Forgot User Password Function

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No account found with this email' });
      return;
    }

    // Generate a reset token
    const resetToken = randomBytes(32).toString('hex');

    // Hash the reset token and store it in the user document
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Construct a professional password reset email template
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333;">
        <div style="text-align: center; padding-bottom: 20px;">
          <img src="https://www.roundcodebox.com/logo.png" alt="RoundCodeBox Logo" style="width: 150px; max-width: 100%;">
        </div>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007BFF;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">
            We received a request to reset your password for your RoundCodeBox account. If you made this request, please click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">Reset Password</a>
          </div>
          <p style="font-size: 16px; color: #555;">
            If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
          </p>
          <p style="font-size: 16px; color: #555;">
            <strong>Security Tip:</strong> Never share your password reset link with anyone.
          </p>
          <p style="font-size: 14px; color: #888;">This link is valid for 1 hour.</p>
        </div>
        <div style="margin-top: 20px; padding: 10px 0; text-align: center; font-size: 14px; color: #888;">
          <p style="margin: 0;">Need help? <a href="mailto:support@roundcodebox.com" style="color: #007BFF;">Email our support team</a></p>
          <p style="margin: 0;">&copy; 2024 RoundCodeBox, Inc. All rights reserved.</p>
          <p style="margin: 0;">123 Main Street, Anytown, USA</p>
          <p style="margin: 0;"><a href="https://www.roundcodebox.com/unsubscribe" style="color: #007BFF;">Unsubscribe</a></p>
        </div>
      </div>
    `;

    // Send the email
    await sendEmail(email, 'Password Reset Request', emailContent);

    res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
