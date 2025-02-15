const Campaign = require('../models/campaignModel');
const cloudinary = require('../utils/cloudinary');
const User = require('../models/userModel');
const CampaignEnums = require('../utils/campaignEnums');

exports.startCampaign = async (req, res) => {
    const { title, description, location, category, beneficiary} = req.body;
    try {
        // Get the user from the database using the userId from the request
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the user is verified and KYC is not pending
        if (!user.isVerified || user.KYCStatus === 'pending') {
            return res.status(400).json({ msg: 'You cannot start a campaign. Verify your account and complete KYC.' });
        }

        // Convert location and category to numbers (assuming they are sent as strings)
        const locationId = parseInt(location, 10);
        const categoryId = parseInt(category, 10);

        // Validate that the location exists in the africanCurrencies list
        const validLocation = CampaignEnums.africanCurrencies.find(item => item.id === locationId);
        if (!validLocation) {
            return res.status(400).json({ msg: 'Invalid location id' });
        }

        // Validate that the category exists in the categories list
        const validCategory = CampaignEnums.categories.find(item => item.id === categoryId);
        if (!validCategory) {
            return res.status(400).json({ msg: 'Invalid category id' });
        }

        const campaign = new Campaign({
            title,
            description,
            location: locationId,
            category: categoryId,
            beneficiary,
            owner: req.userId,
        });

        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
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

        // Assuming campaign.location now holds the country id (as a number or string)
        const countryId = Number(campaign.location);
        const countryCurrency = CampaignEnums.africanCurrencies.find(item => item.id === countryId);

        campaign.currency = countryCurrency 
        campaign.goalAmount = goalAmount;
        campaign.deadline = deadline;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
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
        res.status(500).send('Server error: ' + err.message);
    }
};

exports.setStory = async (req, res) => {
    const { story } = req.body;
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        campaign.story = story;

        await campaign.save();
        res.status(200).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
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
        res.status(500).send('Server error: ' + err.message);
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
        res.status(500).send('Server error: ' + err.message);
    }
};

exports.updateCampaign = async (req, res) => {
    const { title, description, goalAmount, deadline, category, location, beneficiary, story, coverPhoto, videoUrl } = req.body;
    try {
        let campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update simple fields if provided
        if (title) campaign.title = title;
        if (description) campaign.description = description;
        if (goalAmount) campaign.goalAmount = goalAmount;
        if (deadline) campaign.deadline = deadline;
        if (story) campaign.story = story;
        // if (coverPhoto) campaign.coverPhoto = coverPhoto;
        // if (videoUrl) campaign.videoUrl = videoUrl;

        // Update and validate category (assumed to be sent as an id)
        if (category) {
            const catId = parseInt(category, 10);
            const validCategory = CampaignEnums.categories.find(item => item.id === catId);
            if (!validCategory) {
                return res.status(400).json({ msg: 'Invalid category id' });
            }
            campaign.category = catId;
        }

        // Update and validate location (assumed to be sent as an id)
        if (location) {
            const locId = parseInt(location, 10);
            const validLocation = CampaignEnums.africanCurrencies.find(item => item.id === locId);
            if (!validLocation) {
                return res.status(400).json({ msg: 'Invalid location id' });
            }
            campaign.location = locId;
        }

        // Update and validate beneficiary (assumed to be sent as an id)
        if (beneficiary) {
            const benId = parseInt(beneficiary, 10);
            const validBeneficiary = CampaignEnums.beneficiaries.find(item => item.id === benId);
            if (!validBeneficiary) {
                return res.status(400).json({ msg: 'Invalid beneficiary id' });
            }
            campaign.beneficiary = benId;
        }

        await campaign.save();
        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
    }
};

exports.uploadImages = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        if (campaign.owner.toString() !== req.userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Prevent upload if media already exists
        if (campaign.media && campaign.media.length > 0) {
            return res.status(400).json({ msg: 'Media already uploaded. Cannot upload more.' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No media files uploaded' });
        }
        
        // Use a Promise.all to handle multiple files
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
            // Create an upload stream for each file
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                folder: 'media_uploads',
                overwrite: true,
                },
                (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
                }
            );
            // Pipe the file buffer to Cloudinary
            uploadStream.end(file.buffer);
            });
        });
    
        const uploadedImageUrls = await Promise.all(uploadPromises);

        // Append the new media URLs to the campaign.media array
        campaign.media = campaign.media.concat(uploadedImageUrls);
        await campaign.save();

        res.status(200).json({ msg: 'Media uploaded successfully', media: campaign.media });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
    }
};

exports.reviewCampaign = async (req, res) => {
    const { campaignId, action } = req.body; // action: 'approve' or 'reject'
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        campaign.status = action === 'approve' ? 'approved' : 'rejected';
        await campaign.save();

        res.status(200).json({ msg: `Campaign ${action}d successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
    }
};

exports.getCampaignEnums = (req, res) => {
    // const africanCountries = CampaignEnums.africanCurrencies.map(item => item.country);
    res.json({
      africanCurrencies: CampaignEnums.africanCurrencies,
      internationalCurrencies: CampaignEnums.internationalCurrencies,
      categories: CampaignEnums.categories,
      beneficiaries: CampaignEnums.beneficiaries
    });
  };