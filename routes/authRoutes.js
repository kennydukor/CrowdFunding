const express = require('express');
const { signup, verifyOTP, login, resendOTP, deleteUnverifiedUsers } = require('../controllers/authController'); // Include the verifyOTP function
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/verifyOTP', verifyOTP); // New route for OTP verification
router.post('/login', login);
router.post('/resendOTP', resendOTP);
router.delete('/deleteUnverifiedUsers', deleteUnverifiedUsers);

module.exports = router;
