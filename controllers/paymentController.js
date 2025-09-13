const axios = require('axios');
const Bill = require('../models/PrivateCampaign');
const Contribution = require('../models/Contribution');
const { sendEmailNotification } = require('./notificationController'); // Import the notification controller

//TODO: is this for only bill payments?
exports.verifyPaystackcallbackPayment = async (req, res) => {
 const { reference } = req.query;

 try {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
   headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
   },
  });

  if (response.data.data.status === 'success') {
   const [id, timestamp] = reference.split('_');
   const amount = response.data.data.amount / 100;

   await handlePaymentSuccess(id, amount);
   res.status(200).json({ msg: 'Payment verified successfully' });
  } else {
   res.status(400).json({ msg: 'Payment verification failed' });
  }
 } catch (err) {
  console.error(err);
  res.status(500).send('Server error');
 }
};

const handlePaymentSuccess = async (id, amount) => {
 let updated = false;

 // Try to find and update the bill
 const bill = await Bill.findById(id);
 if (bill) {
  bill.shares.forEach((share) => {
   if (!share.paid && share.amount === amount) {
    share.paid = true;
    updated = true;

    // Send payment confirmation email
    sendEmailNotification({
     body: {
      to: share.user.email,
      subject: 'Payment Confirmation',
      text: `Your payment of ${amount} for the bill titled "${bill.title}" has been confirmed. Thank you!`,
     },
    });
   }
  });

  if (updated) {
   await bill.save();
   return;
  }
 }

 // Try to find and update the contribution
 const contribution = await Contribution.findById(id);
 if (contribution && contribution.amount === amount && !contribution.paid) {
  contribution.paid = true;
  await contribution.save();

  // Send payment confirmation email
  sendEmailNotification({
   body: {
    to: contribution.contributor.email,
    subject: 'Payment Confirmation',
    text: `Your payment of ${amount} for the campaign "${contribution.campaign.title}" has been confirmed. Thank you!`,
   },
  });
 }
};


exports.verifyPayPalPayment = async (req, res) => {
 const { paymentId, PayerID } = req.query;

 try {
  const response = await axios.post(
   `https://api-m.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
   {
    payer_id: PayerID,
   },
   {
    auth: {
     username: process.env.PAYPAL_CLIENT_ID,
     password: process.env.PAYPAL_SECRET,
    },
   },
  );

  if (response.data.state === 'approved') {
   const { invoice_number, transactions } = response.data;
   const amount = parseFloat(transactions[0].amount.total);

   await handlePaymentSuccess(invoice_number, amount);
   res.status(200).json({ msg: 'Payment verified successfully' });
  } else {
   res.status(400).json({ msg: 'Payment verification failed' });
  }
 } catch (err) {
  console.error(err);
  res.status(500).send('Server error');
 }
};
