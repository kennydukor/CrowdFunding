const Contribution = require('../models/contributionModel');
const Campaign = require('../models/campaignModel');
const axios = require('axios');

const { sendEmailNotification } = require('./notificationController'); // Import the notification controller

exports.createContribution = async (req, res) => {
    const { campaignId, amount, anonymous } = req.body;
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

        const contribution = new Contribution({
            campaign: campaignId,
            contributor: req.userId,
            amount,
            anonymous,
        });

        await contribution.save();

        campaign.raisedAmount += amount;
        await campaign.save();

        // Send notification to contributor
        await sendEmailNotification({
            body: {
                to: req.user.email,
                subject: 'Contribution Received',
                text: `Thank you for your contribution of ${amount} to the campaign "${campaign.title}".`,
            }
        });

        res.status(201).json(contribution);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const generatePaymentLink = async (amount, email, description, campaignId) => {
    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            amount: amount * 100, // Amount in kobo
            email,
            reference: `${campaignId}_${Date.now()}`,
            callback_url: 'http://localhost:5000/api/payments/paystack/verify',
            metadata: {
                custom_fields: [
                    {
                        display_name: 'Description',
                        variable_name: 'description',
                        value: description,
                    }
                ]
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.data.authorization_url;
    } catch (err) {
        console.error(err);
        throw new Error('Unable to generate payment link');
    }
};

exports.getContributionsByCampaign = async (req, res) => {
    try {
        const contributions = await Contribution.find({ campaign: req.params.campaignId });
        res.json(contributions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getContributionsByUser = async (req, res) => {
    try {
        const contributions = await Contribution.find({ contributor: req.userId });
        res.json(contributions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
