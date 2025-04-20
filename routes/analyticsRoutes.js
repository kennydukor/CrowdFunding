const express = require('express');
const { getUserCampaignAnalytics, getCampaignStats } = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get summary analytics for campaigns created by the logged-in user
router.get('/creator/summary', authMiddleware, getUserCampaignAnalytics);

// Get detailed stats for a specific campaign (public or owner-based)
router.get('/creator/:campaignId', authMiddleware, getCampaignStats);

module.exports = router;
