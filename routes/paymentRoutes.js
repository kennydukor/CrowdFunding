const express = require('express');
const { verifyPaystackPayment, verifyPayPalPayment } = require('../controllers/paymentController');

const router = express.Router();

router.get('/paystack/verify', verifyPaystackPayment);
router.get('/paypal/verify', verifyPayPalPayment);

module.exports = router;
