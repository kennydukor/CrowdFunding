const express = require('express');
const { signup, verifyOTP, login } = require('../controllers/authController'); // Include the verifyOTP function
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/verifyOTP', verifyOTP); // New route for OTP verification
router.post('/login', login);

module.exports = router;
