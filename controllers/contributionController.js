const { FundingLog, PaymentProvider, Contribution, Campaign, User } = require('../models');
const sequelize = require('../utils/db');  // Ensure transactions are handled properly (atomic operations)
const axios = require('axios');

const { sendEmailNotification } = require('./notificationController'); // Import the notification controller
const { generatePaymentLink } = require('../services/paymentService');

exports.initiatePayment = async (req, res) => {
    const { campaignId, amount, paymentMethod, paymentProviderId } = req.body;
  
    try {
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
  
      const user = await User.findByPk(req.userId);
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      const paymentProvider = await PaymentProvider.findByPk(paymentProviderId);
      if (!paymentProvider) return res.status(400).json({ msg: 'Invalid payment provider' });
  
      const systemTransactionId = `sys_${Date.now()}`;
  
      // Generate the payment link using the appropriate service
      const paymentLink = await generatePaymentLink({
        providerKey: paymentProvider.key, // Example: 'paystack'
        amount,
        user,
        campaign,
        transactionId: systemTransactionId,
      });
  
      const transaction = await FundingLog.create({
        campaignId,
        userId: req.userId,
        paymentProviderId,
        amount,
        currency: campaign.currency || 'NGN', // fallback
        paymentMethod,
        systemTransactionId,
        status: 'pending',
        metadata: {
          userEmail: user.email,
          userPhone: user.phone,
          campaignTitle: campaign.title,
          paymentLink: paymentLink,
          // ...anything else you'd like to log
        },
      });
  
      res.status(201).json({ msg: 'Payment initiated', paymentLink, transaction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  };
  

exports.handlePaymentCallback = async (req, res) => {
    try {
        // 1️⃣ Identify the payment provider from the payload
        const { providerId } = req.query;

        if (!providerId) {
            return res.status(400).json({ msg: 'Payment provider ID is required' });
        }

        const paymentProvider = await PaymentProvider.findByPk(providerId);
        if (!paymentProvider) {
            return res.status(400).json({ msg: 'Invalid payment provider' });
        }

        let systemTransactionId, providerTransactionId, receivedAmount, status;

        // 2️⃣ Parse webhook response based on provider
        switch (paymentProvider.key.toLowerCase()) {
            case 'stripe':
                systemTransactionId = req.body.metadata.systemTransactionId;
                providerTransactionId = req.body.id;
                receivedAmount = parseFloat(req.body.amount) / 100; // Convert cents to dollars
                status = req.body.status === 'succeeded' ? 'successful' : 'failed';
                break;

            case 'paypal':
                systemTransactionId = req.body.invoice_id;
                providerTransactionId = req.body.id;
                receivedAmount = parseFloat(req.body.purchase_units[0].amount.value);
                status = req.body.status === 'COMPLETED' ? 'successful' : 'failed';
                break;

            case 'flutterwave':
                systemTransactionId = req.body.txRef;
                providerTransactionId = req.body.transaction_id;
                receivedAmount = parseFloat(req.body.amount);
                status = req.body.status === 'successful' ? 'successful' : 'failed';
                break;

            case 'paystack':
                systemTransactionId = req.body.data.reference;
                providerTransactionId = req.body.data.id;
                receivedAmount = parseFloat(req.body.data.amount) / 100; // Convert kobo to naira
                status = req.body.data.status === 'success' ? 'successful' : 'failed';
                break;

            default:
                return res.status(400).json({ msg: 'Unsupported payment provider' });
        }

        // 3️⃣ Find funding log by system transaction ID
        const fundingLog = await FundingLog.findOne({ where: { systemTransactionId } });
        if (!fundingLog) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }

        // If already processed, ignore
        if (fundingLog.status !== 'pending') {
            return res.status(400).json({ msg: 'Transaction already processed' });
        }

        // // 4️⃣ Verify received amount matches the expected amount
        // if (receivedAmount !== fundingLog.amount) {
        //     return res.status(400).json({
        //         msg: 'Payment amount mismatch',
        //         expectedAmount: fundingLog.amount,
        //         receivedAmount
        //     });
        // }

        // 5️⃣ Update FundingLog with providerTransactionId & status
        fundingLog.providerTransactionId = providerTransactionId;
        fundingLog.status = status;
        fundingLog.receivedAmount = receivedAmount;
        fundingLog.amountMismatch = receivedAmount !== parseFloat(fundingLog.amount);
        await fundingLog.save();

        // 6️⃣ If payment is successful, create a contribution
        if (status === 'successful') {
            if (fundingLog.amountMismatch) {
                // Optional: skip contribution or notify admins
                return res.status(200).json({
                  msg: 'Payment received but amount mismatch detected. Manual review required.',
                  fundingLog
                });
              }
              
            const contribution = await Contribution.create({
                campaignId: fundingLog.campaignId,
                contributorId: fundingLog.userId,
                amount: fundingLog.amount,
                anonymous: false,
            });

            // Update campaign raised amount
            await Campaign.increment('raisedAmount', {
                by: fundingLog.amount,
                where: { id: fundingLog.campaignId }
            });

            return res.status(200).json({ msg: 'Payment confirmed. Contribution recorded.', contribution });
        }

        return res.status(400).json({ msg: 'Payment failed. Contribution not recorded.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getContributionsByCampaign = async (req, res) => {
    try {
        const contributions = await Contribution.findAll({ where: { campaignId: req.params.campaignId } });
        res.json(contributions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getContributionsByUser = async (req, res) => {
    try {
        const contributions = await Contribution.find({ where: { contributor: req.userId } });
        res.json(contributions);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
