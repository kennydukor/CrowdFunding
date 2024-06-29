const express = require('express');
const { createBill, sendPaymentRequests, trackBillPayments, getUserBills } = require('../controllers/billController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createBill);
router.post('/:billId/requests', authMiddleware, sendPaymentRequests);
router.get('/:billId', authMiddleware, trackBillPayments);
router.get('/user', authMiddleware, getUserBills);  // New endpoint to get user bills

module.exports = router;
