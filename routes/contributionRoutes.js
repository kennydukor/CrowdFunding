const express = require('express');
const { initiatePayment, getContributionsByCampaign, getContributionsByUser, handlePaystackCallbackVerification } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, initiatePayment);
router.get('/campaign/:campaignId', getContributionsByCampaign);
router.get('/user', authMiddleware, getContributionsByUser);

//for the sake of fixing this issue
router.post('/verify-paystack-contribution', handlePaystackCallbackVerification);

module.exports = router;
