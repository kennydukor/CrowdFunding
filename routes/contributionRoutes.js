const express = require('express');
const { initiatePayment, getContributionsByCampaign, getContributionsByUser, handlePaystackCallbackVerification, initiateAnonymousPayment } = require('../controllers/contributionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, initiatePayment);
router.post('/anonymous', initiateAnonymousPayment);
// router.get('/campaign/:campaignId', getContributionsByCampaign);
router.get('/campaign/:id', authMiddleware, getContributionsByUser);

//for the sake of fixing this issue
router.post('/verify-paystack-contribution', handlePaystackCallbackVerification);

module.exports = router;
