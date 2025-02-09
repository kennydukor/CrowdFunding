const PrivateCampaign = require('../models/privateCampaignModel');
const axios = require('axios');
const { sendEmailNotification } = require('./notificationController'); // Import the notification controller

// ✅ Create a Private Campaign
exports.createPrivateCampaign = async (req, res) => {
    const { title, totalAmount, shares } = req.body;
    try {
        const campaign = new PrivateCampaign({
            title,
            totalAmount,
            shares,
            creator: req.userId,
        });

        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// ✅ Send Payment Requests for a Private Campaign
exports.sendPaymentRequests = async (req, res) => {
    try {
        const campaign = await PrivateCampaign.findById(req.params.campaignId).populate('shares.user');
        if (!campaign) return res.status(404).json({ msg: 'Private campaign not found' });

        for (const share of campaign.shares) {
            const paymentLink = await generatePaymentLink(share.amount, share.user.email, `Payment for ${campaign.title}`, campaign._id);

            // Send payment request email
            await sendEmailNotification({
                body: {
                    to: share.user.email,
                    subject: 'Payment Request',
                    text: `Hello ${share.user.firstName},\n\nYou have a pending payment of ${share.amount} for the campaign titled "${campaign.title}". Please make the payment using the following link:\n\n${paymentLink}\n\nThank you!`,
                }
            });
        }

        res.status(200).json({ msg: 'Payment requests sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// ✅ Generate Payment Link
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

// ✅ Track Payments for a Private Campaign
exports.trackCampaignPayments = async (req, res) => {
    try {
        const campaign = await PrivateCampaign.findById(req.params.campaignId);
        if (!campaign) return res.status(404).json({ msg: 'Private campaign not found' });

        res.json(campaign);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// ✅ Get User's Private Campaigns
exports.getUserCampaigns = async (req, res) => {
    try {
        const campaigns = await PrivateCampaign.find({ 'shares.user': req.userId });
        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
