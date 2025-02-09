const express = require('express');
const { createPrivateCampaign, sendPaymentRequests, trackCampaignPayments, getUserCampaigns } = require('../controllers/privateCampaignController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPrivateCampaign);
router.post('/:campaignId/requests', authMiddleware, sendPaymentRequests);
router.get('/:campaignId', authMiddleware, trackCampaignPayments);
router.get('/user', authMiddleware, getUserCampaigns);  // New endpoint to get user bills

module.exports = router;
