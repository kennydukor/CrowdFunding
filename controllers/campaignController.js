const Campaign = require('../models/campaignModel');

exports.startCampaign = async (req, res) => {
    const { location, category, beneficiary } = req.body;
    try {
        const campaign = new Campaign({
            location,
            category,
            beneficiary,
            owner: req.userId,
        });

        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.setGoal = async (req, res) => {
    const { goalAmount, deadline } = req.body;
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.goalAmount = goalAmount;
        campaign.deadline = deadline;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.addMedia = async (req, res) => {
    const { coverPhoto, videoUrl } = req.body;
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.coverPhoto = coverPhoto;
        campaign.videoUrl = videoUrl;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.setStory = async (req, res) => {
    const { title, story } = req.body;
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.title = title;
        campaign.story = story;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.completeFundraiser = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.isComplete = true;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getCampaignById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.updateCampaign = async (req, res) => {
    const { title, description, goalAmount, deadline, category, media, location, beneficiary, story, coverPhoto, videoUrl } = req.body;
    try {
        let campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.title = title || campaign.title;
        campaign.description = description || campaign.description;
        campaign.goalAmount = goalAmount || campaign.goalAmount;
        campaign.deadline = deadline || campaign.deadline;
        campaign.category = category || campaign.category;
        campaign.media = media || campaign.media;
        campaign.location = location || campaign.location;
        campaign.beneficiary = beneficiary || campaign.beneficiary;
        campaign.story = story || campaign.story;
        campaign.coverPhoto = coverPhoto || campaign.coverPhoto;
        campaign.videoUrl = videoUrl || campaign.videoUrl;

        await campaign.save();
        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};