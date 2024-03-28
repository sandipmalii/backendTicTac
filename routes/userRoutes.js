import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middleware/auth-middleware.js';

// Route-level Middleware - To Protect Routes
router.use('/changepassword', checkUserAuth);
router.use('/loggeduser', checkUserAuth);

// Public Routes
router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token', UserController.userPasswordReset);

// Protected Routes
router.post('/changepassword', UserController.changeUserPassword); // Renamed route to avoid duplication
router.get('/loggeduser', UserController.loggedUser); // Renamed route to avoid duplication

export default router;
