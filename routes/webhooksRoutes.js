const express = require('express');
const { verifyPaystackTransactionUsingWebhook } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/paystack', verifyPaystackTransactionUsingWebhook);

module.exports = router;
