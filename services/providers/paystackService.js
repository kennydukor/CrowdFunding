const axios = require('axios');
const ApiError = require('../../utils/api-error');
require('dotenv').config();
exports.generatePaymentLink = async ({ amount, user, campaign, transactionId }) => {
 const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

 const config = {
  headers: {
   Authorization: `Bearer ${paystackSecret}`,
   'Content-Type': 'application/json',
  },
 };

 const payload = {
  email: user.email,
  amount: Math.round(amount * 100),
  reference: transactionId,
  //callback_url: `${process.env.BASE_URL}/api/contributions/callback?providerId=1`,
  metadata: {
   userId: user.id,
   campaignId: campaign.id,
   systemTransactionId: transactionId,
  },
 };

 const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, config);

 if (!response.data.status) {
  throw new Error(response.data.message || 'Failed to initialize payment');
 }

 return response.data.data;
};

exports.generateAnonymousPaymentlink = async ({ amount, email, campaignId, transactionId }) => {
 const config = {
  headers: {
   Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
   'Content-Type': 'application/json',
  },
 };

 const payload = {
  email,
  amount: Math.round(amount * 100), //convert to kobo
  reference: transactionId,
  //callback_url: `${process.env.BASE_URL}/api/contributions/callback?providerId=1`,
  metadata: {
   userEmail: email,
   campaignId,
   systemTransactionId: transactionId,
  },
 };

 const response = await axios.post(`${process.env.PAYSTACK_BASE_URL}/transaction/initialize`, payload, config);

 //TODO: test this well
 if (!response.data.status) {
  throw new ApiError(response.data.message || 'Failed to initialize payment', 400, response.data);
 }

 return response.data.data;
};
