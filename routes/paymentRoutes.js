const express = require('express');
const { verifyPaystackPayment, verifyPayPalPayment } = require('../controllers/paymentController');
const {generatePaymentLink} = require("../services/paymentService");

const router = express.Router();

//router.get('/paystack/verify', verifyPaystackPayment);
router.get('/paypal/verify', verifyPayPalPayment);
router.post('/initializePayment', generatePaymentLink);
module.exports = router;
