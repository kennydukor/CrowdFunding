const express = require('express');
const { getAllCampaigns, approveCampaign, rejectCampaign, blockUser, unblockUser } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/campaigns', authMiddleware, adminMiddleware, getAllCampaigns);
router.post('/campaigns/:campaignId/approve', authMiddleware, adminMiddleware, approveCampaign);
router.post('/campaigns/:campaignId/reject', authMiddleware, adminMiddleware, rejectCampaign);
router.post('/users/:userId/block', authMiddleware, adminMiddleware, blockUser);
router.post('/users/:userId/unblock', authMiddleware, adminMiddleware, unblockUser);

module.exports = router;
