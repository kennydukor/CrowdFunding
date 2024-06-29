const express = require('express');
const { createContribution, getContributionsByCampaign, getContributionsByUser } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createContribution);
router.get('/campaign/:campaignId', getContributionsByCampaign);
router.get('/user', authMiddleware, getContributionsByUser);

module.exports = router;
