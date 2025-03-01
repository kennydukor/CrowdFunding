const express = require('express');
const { startCampaign, setGoal, uploadVideo, setStory, completeFundraiser, getCampaigns, getCampaignById, updateCampaign, uploadImages } = require('../controllers/campaignController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');
const { uploadMedia, uploadVideo: uploadVideoMiddlware } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/start', authMiddleware, startCampaign);
router.put('/:campaignId/goal', [authMiddleware,
    check('goalAmount', 'Goal amount is required').isNumeric(),
    check('deadline', 'Deadline is required').isISO8601(),
    // check('currency', 'Invalid currency').isIn(CampaignEnums.africanCurrencies)
], setGoal);
router.put('/:campaignId/media/video', authMiddleware, uploadVideoMiddlware, uploadVideo);
router.put('/:campaignId/story', authMiddleware, setStory);
router.put('/:campaignId/complete', authMiddleware, completeFundraiser);
router.put('/:campaignId', authMiddleware, updateCampaign);

// New route for uploading extra media files (multiple images)
router.put('/:campaignId/media/images', authMiddleware, uploadMedia.array('mediaFiles', 5), uploadImages);

router.get('/:campaignId', getCampaignById);
router.get('/', getCampaigns);

module.exports = router;
