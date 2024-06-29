// Bill Sharing Program
const Bill = require('../models/billModel');
const axios = require('axios');
const { sendEmailNotification } = require('./notificationController'); // Import the notification controller

exports.createBill = async (req, res) => {
    const { title, totalAmount, shares } = req.body;
    try {
        const bill = new Bill({
            title,
            totalAmount,
            shares,
            creator: req.userId,
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.sendPaymentRequests = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId).populate('shares.user');
        if (!bill) return res.status(404).json({ msg: 'Bill not found' });

        for (const share of bill.shares) {
            const paymentLink = await generatePaymentLink(share.amount, share.user.email, `Bill payment for ${bill.title}`, bill._id);

            // Send payment request email
            await sendEmailNotification({
                body: {
                    to: share.user.email,
                    subject: 'Payment Request',
                    text: `Hello ${share.user.firstName},\n\nYou have a pending payment of ${share.amount} for the bill titled "${bill.title}". Please make the payment using the following link:\n\n${paymentLink}\n\nThank you!`,
                }
            });
        }

        res.status(200).json({ msg: 'Payment requests sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

const generatePaymentLink = async (amount, email, description, billId) => {
    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            amount: amount * 100, // Amount in kobo
            email,
            reference: `${billId}_${Date.now()}`,
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

exports.trackBillPayments = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId);
        if (!bill) return res.status(404).json({ msg: 'Bill not found' });

        res.json(bill);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getUserBills = async (req, res) => {
    try {
        const bills = await Bill.find({ 'shares.user': req.userId });
        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
