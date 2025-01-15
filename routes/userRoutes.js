const express = require('express');
const { signup, verifyOTP, login } = require('../controllers/authController'); // Include the verifyOTP function
const { getProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/userController'); // Import user functions
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/verifyOTP', verifyOTP); // New route for OTP verification during signup
router.post('/login', login);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/changePassword', authMiddleware, changePassword);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword); // Update to handle OTP verification for password reset

module.exports = router;
