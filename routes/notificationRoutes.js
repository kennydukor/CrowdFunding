const express = require('express');
const { sendEmailNotification, sendSMSNotification, sendPushNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/email', authMiddleware, sendEmailNotification);
router.post('/sms', authMiddleware, sendSMSNotification);
router.post('/push', authMiddleware, sendPushNotification);

module.exports = router;
