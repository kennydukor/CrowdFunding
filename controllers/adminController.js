const Campaign = require('../models/Campaign');
const User = require('../models/User');

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.approveCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        campaign.status = 'approved';
        await campaign.save();
        res.status(200).json({ msg: 'Campaign approved' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.rejectCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        campaign.status = 'rejected';
        await campaign.save();
        res.status(200).json({ msg: 'Campaign rejected' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.status = 'blocked';
        await user.save();
        res.status(200).json({ msg: 'User blocked' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.status = 'active';
        await user.save();
        res.status(200).json({ msg: 'User unblocked' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
