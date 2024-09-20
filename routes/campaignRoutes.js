const express = require('express');
const { startCampaign, setGoal, addMedia, setStory, completeFundraiser, getCampaigns, getCampaignById, updateCampaign } = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.post('/start', authMiddleware, startCampaign);
router.put('/:campaignId/goal', [authMiddleware,
    check('goalAmount', 'Goal amount is required').isNumeric(),
    check('deadline', 'Deadline is required').isISO8601(),
    check('currency', 'Invalid currency').isIn(['GHS', 'NGN', 'GBP', 'CAD', 'USD', 'EUR', 'KES', 'ZAR', 'RWF', 'ETB', 'EGP', 'SLL', 'LRD'])
], setGoal);
router.put('/:campaignId/media', authMiddleware, addMedia);
router.put('/:campaignId/story', authMiddleware, setStory);
router.put('/:campaignId/complete', authMiddleware, completeFundraiser);
router.get('/', getCampaigns);
router.get('/:campaignId', getCampaignById);
router.put('/:campaignId', authMiddleware, updateCampaign);

module.exports = router;
