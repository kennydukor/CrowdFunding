const express = require('express');
const { getProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/userController'); // Import user functions
const authMiddleware = require('../middlewares/authMiddleware');
const {uploadProfilePicture, uploadMedia} = require('../middlewares/uploadMiddleware')

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, uploadProfilePicture.single('profilePicture'), updateProfile);
router.post('/changePassword', authMiddleware, changePassword);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword); // Update to handle OTP verification for password reset

module.exports = router;
