// src/utils/authUtils.ts

import { randomBytes } from "crypto";

/**
 * Validates the strength of a password.
 * @param password - The password to validate.
 * @returns true if the password meets the requirements; otherwise, false.
 */
export const validatePassword = (password: string): boolean => {
    const passwordStrengthRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordStrengthRegex.test(password);
};

/**
 * Generates the content for a welcome email.
 * @param username - The username of the new user.
 * @returns The HTML content for the email.
 */
export const createWelcomeEmail = (username: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://www.roundcodebox.com/logo.png" alt="RoundCodeBox Logo" style="width: 150px; max-width: 100%;">
      </div>
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #007BFF;">Welcome to RoundCodeBox, ${username}!</h2>
        <p style="font-size: 16px; color: #555;">Hi ${username},</p>
        <p style="font-size: 16px; color: #555;">
          We're excited to have you join our community! You now have access to all the features of our platform.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://www.roundcodebox.com/login" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">Log In to Your Account</a>
        </div>
      </div>
      <div style="margin-top: 20px; padding: 10px 0; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Need help? <a href="mailto:support@roundcodebox.com" style="color: #007BFF;">Email our support team</a></p>
        <p style="margin: 0;">&copy; 2024 RoundCodeBox, Inc. All rights reserved.</p>
      </div>
    </div>
  `;
};

/**
 * Generates the content for a password reset email.
 * @param resetLink - The password reset link.
 * @returns The HTML content for the email.
 */
export const createPasswordResetEmail = (resetLink: string): string => {
    return `
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
        <p style="font-size: 16px; color: #555;">If you did not request a password reset, please ignore this email or contact our support team.</p>
      </div>
      <div style="margin-top: 20px; padding: 10px 0; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Need help? <a href="mailto:support@roundcodebox.com" style="color: #007BFF;">Email our support team</a></p>
        <p style="margin: 0;">&copy; 2024 RoundCodeBox, Inc. All rights reserved.</p>
      </div>
    </div>
  `;
};

/**
 * Generates the content for a password reset confirmation email.
 * @returns The HTML content for the email.
 */
export const createPasswordResetConfirmationEmail = (): string => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; color: #333;">
      <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://www.roundcodebox.com/logo.png" alt="RoundCodeBox Logo" style="width: 150px; max-width: 100%;">
      </div>
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #007BFF;">Your Password Has Been Reset</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">
          Your password for your RoundCodeBox account has been successfully reset. If you did not make this change, please contact our support team immediately.
        </p>
        <p style="font-size: 16px; color: #555;">
          For your security, we recommend using a unique and strong password.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://www.roundcodebox.com/login" style="display: inline-block; padding: 12px 24px; background-color: #007BFF; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">Log In to Your Account</a>
        </div>
      </div>
      <div style="margin-top: 20px; padding: 10px 0; text-align: center; font-size: 14px; color: #888;">
        <p style="margin: 0;">Need help? <a href="mailto:support@roundcodebox.com" style="color: #007BFF;">Email our support team</a></p>
        <p style="margin: 0;">&copy; 2024 RoundCodeBox, Inc. All rights reserved.</p>
      </div>
    </div>
  `;
};
