const express = require('express');
const { shareCampaign, postComment, followCampaign } = require('../controllers/socialController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/share', authMiddleware, shareCampaign);
router.post('/comment', authMiddleware, postComment);
router.post('/follow', authMiddleware, followCampaign);

module.exports = router;
