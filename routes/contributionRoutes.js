const express = require('express');
const { initiatePayment, getContributionsByCampaign, getContributionsByUser } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, initiatePayment);
router.get('/campaign/:campaignId', getContributionsByCampaign);
router.get('/user', authMiddleware, getContributionsByUser);

module.exports = router;
