// src/routes/authRoutes.ts

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthRequest } from "../middleware/authMiddleware";
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } from '../controllers/authController';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// Route: User Dashboard
router.get(
    "/user-dashboard",
    authMiddleware, // Use the authMiddleware here
    (req: AuthRequest, res: express.Response): void => {
        const { userId, role } = req.user || {}; // Access the user from req.user
        console.log(`[Debug] User-Dashboard: UserID=${userId}, Role=${role}`);
        res.status(200).json({ message: "Welcome to the User Dashboard", userId, role });
    }
);

// Route: Admin Dashboard
router.get(
    "/admin-dashboard",
    authMiddleware, // Use the authMiddleware here
    (req: AuthRequest, res: express.Response): void => {
        const { userId, role } = req.user || {}; // Access the user from req.user
        console.log(`[Debug] Admin-Dashboard: UserID=${userId}, Role=${role}`);
        res.status(200).json({ message: "Welcome to the Admin Dashboard", userId, role });
    }
);

// Route: Super Admin Dashboard
router.get(
    "/super-admin-dashboard",
    authMiddleware, // Use the authMiddleware here
    (req: AuthRequest, res: express.Response): void => {
        const { userId, role } = req.user || {}; // Access the user from req.user
        console.log(`[Debug] Super-Admin-Dashboard: UserID=${userId}, Role=${role}`);
        res.status(200).json({ message: "Welcome to the Super Admin Dashboard", userId, role });
    }
);

export default router;
