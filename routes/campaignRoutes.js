const express = require('express');
const { startCampaign, setGoal, addMedia, setStory, completeFundraiser, getCampaigns, getCampaignById, updateCampaign } = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/start', authMiddleware, startCampaign);
router.put('/:campaignId/goal', authMiddleware, setGoal);
router.put('/:campaignId/media', authMiddleware, addMedia);
router.put('/:campaignId/story', authMiddleware, setStory);
router.put('/:campaignId/complete', authMiddleware, completeFundraiser);
router.get('/', getCampaigns);
router.get('/:campaignId', getCampaignById);
router.put('/:campaignId', authMiddleware, updateCampaign);

module.exports = router;
