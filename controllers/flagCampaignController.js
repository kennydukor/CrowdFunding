const flagCampaign = require('../models/flagCampaignModel');
const axios = require('axios');

exports.flagCampaign = async (req, res) => {
    const { campaignId, reason } = req.body;
    try {
        const flag = new Flag({
            campaign: campaignId,
            flaggedBy: req.userId,
            reason
        });

        await flag.save();
        res.status(201).json({ msg: 'Campaign flagged for review' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.reviewFlag = async (req, res) => {
    const { flagId, action } = req.body; // action: 'approve' or 'reject'
    try {
        const flag = await Flag.findById(flagId);
        if (!flag) return res.status(404).json({ msg: 'Flag not found' });

        if (action === 'approve') {
            // Take down the campaign or mark it as invalid
            const campaign = await Campaign.findById(flag.campaign);
            campaign.status = 'flagged';
            await campaign.save();
        }

        flag.status = 'reviewed';
        await flag.save();

        res.status(200).json({ msg: 'Flag reviewed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};