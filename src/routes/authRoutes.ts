// src/routes/authRoutes.ts

import express from 'express';
import { registerUser, loginUser, logoutUser, forgotPassword } from '../controllers/authController';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

// Protected route example
router.get('/user-dashboard', verifyToken, (req: AuthRequest, res: express.Response): void => {
    const userRole = req.user?.role;
    res.status(200).json({ message: 'Welcome to the User Dashboard!' });
});

router.get('/admin-dashboard', verifyToken, (req: AuthRequest, res: express.Response): void => {
    const userRole = req.user?.role;
    if (userRole !== 'admin' && userRole !== 'super_admin') {
        res.status(403).json({ message: 'Access denied. Admins only.' });
        return;
    }
    res.status(200).json({ message: 'Welcome to the Admin Dashboard!' });
});

router.get('/super-admin-dashboard', verifyToken, (req: AuthRequest, res: express.Response): void => {
    const userRole = req.user?.role;
    if (userRole !== 'super_admin') {
        res.status(403).json({ message: 'Access denied. Super Admins only.' });
        return;
    }
    res.status(200).json({ message: 'Welcome to the Super Admin Dashboard!' });
});

export default router;
