// services/providers/paystack.js
const axios = require('axios');

exports.generatePaymentLink = async ({ amount, user, campaign, transactionId}) => {
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
    // 🛑 Stop and throw an error
    throw new Error(response.data.message || 'Failed to initialize payment');
  }

  return response.data.data;
};
