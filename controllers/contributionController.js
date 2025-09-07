const { FundingLog, PaymentProvider, Contribution, Campaign, User } = require('../models');
const sequelize = require('../utils/db'); // Ensure transactions are handled properly (atomic operations)
const axios = require('axios');
const { sendEmailNotification } = require('./notificationController'); // Import the notification controller
const { generatePaymentLink } = require('../services/paymentService');
const { sendSuccess } = require('../utils/general');

exports.initiatePayment = async (req, res, next) => {
 let { campaignId, amount, requestCurrency, paymentMethod, paymentProviderId } = req.body;
 try {
  const campaign = await Campaign.findByPk(campaignId);

  // 🔒 Ensure campaign is active and approved
  if (!campaign.isComplete || campaign.status !== 'approved') {
   return res.status(400).json({
    msg: 'This campaign is not open for contributions. It must be approved and active.',
   });
  }

  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const paymentProvider = await PaymentProvider.findByPk(paymentProviderId);
  if (!paymentProvider) return res.status(400).json({ msg: 'Invalid payment provider' });

  const systemTransactionId = `sys_${Date.now()}`;

  /* -- optional FX look‑up if requestCurrency !== campaign.currency -- */
  let fxRate = null;
  let baseAmt = null;
  //let baseCurrency = campaign.currency;
  if (requestCurrency && requestCurrency !== campaign.currency) {
   // fetch live or cached FX rate here
   // fxRate = await getRate(requestCurrency, campaign.currency);
   fxRate = 1; // Placeholder for actual FX rate lookup
   baseAmt = (parseFloat(amount) * fxRate).toFixed(2);
   //let baseCurrency = campaign.currency;
   return res.status(400).json({
    msg: 'Currency conversion not supported yet. Please use the campaign currency.',
   });
  }

  // Generate the payment link using the appropriate service
  const checkoutInfo = await generatePaymentLink({
   providerKey: paymentProvider.key,
   amount,
   currency: requestCurrency,
   user,
   campaign,
   transactionId: systemTransactionId,
  });
  console.log(checkoutInfo);
  // TODO: how do we handle contributing money for different currencies and then receiving primarily with naira and dollar and pounds and euro and CAD first
  const transaction = await FundingLog.create({
   campaignId,
   userId: req.userId,
   paymentProviderId,
   amountRequested: amount,
   requestCurrency,
   baseAmount: baseAmt,
   baseCurrency: requestCurrency,
   fxRate,
   paymentMethod,
   systemTransactionId,
   status: 'pending',
   metadata: {
    userEmail: user.email,
    userPhone: user.phone,
    campaignTitle: campaign.title,
    checkoutInfo: checkoutInfo,
   },
  });

  return sendSuccess(
   res,
   'Payment initiated',
   {
    authorizationUrl: checkoutInfo.authorization_url,
    accessCode: checkoutInfo.access_code,
    reference: checkoutInfo.reference,
   },
   201,
  );
 } catch (err) {
  console.error(err);
  // res.status(500).json({ msg: 'Server error', error: err.message });
  next(err);
 }
};

//FIXME: fix the provider issue, @okeoma's solution says get the provider info from the system transaction ref.
exports.handlePaymentCallback = async (req, res) => {
 try {
  // 1️⃣ Identify the payment provider from the payload
  const { info } = req.body;

  console.log({ info });

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
    const event = req.body;
    if (event === 'charge.success') {
     systemTransactionId = event.reference;
     providerTransactionId = req.body.data.id;
     receivedAmount = parseFloat(req.body.data.amount) / 100; // Convert kobo to naira
    }
    //status = req.body.data.status === 'success' ? 'successful' : 'failed';
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
     fundingLog,
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
    where: { id: fundingLog.campaignId },
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

exports.handlePaystackCallbackVerification = async (req, res, next) => {
 const { reference } = req.query;

 if (!reference) {
  return next(Error('No reference found in request'));
 }

 try {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
   headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
   },
  });

  const paymentProvider = await PaymentProvider.findOne({
   where: {
    key: 'paystack',
   },
  });

  if (!paymentProvider) {
   return res.status(400).json({ msg: 'Invalid payment provider' });
  }

  let systemTransactionId, providerTransactionId, receivedAmount, status;

  const event = response.data?.data;
  systemTransactionId = event.reference;
  providerTransactionId = event.id;
  status = event.status;
  receivedAmount = parseFloat(event.amount) / 100; // Convert kobo to naira

  /** 3️⃣ Find funding log by system transaction ID*/
  const fundingLog = await FundingLog.findOne({ where: { systemTransactionId } });

  if (!fundingLog) {
   return res.status(404).json({ msg: 'Transaction not found' });
  }

  /** If already processed, ignore */
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
  fundingLog.status = status === 'success' ? 'successful' : 'pending';
  fundingLog.receivedAmount = receivedAmount;
  fundingLog.amountMismatch = receivedAmount !== parseFloat(fundingLog.amountRequested);
  await fundingLog.save();

  // 6️⃣ If payment is successful, create a contribution
  if (status === 'success') {
   if (fundingLog.amountMismatch) {
    // Optional: skip contribution or notify admins
    return res.status(200).json({
     msg: 'Payment received but amount mismatch detected. Manual review required.',
     fundingLog: {
      id: fundingLog.id,
      campaignId: fundingLog.campaignId,
      userId: fundingLog.userId,
      amountRequested: fundingLog.amountRequested,
      requestCurrency: fundingLog.requestCurrency,
      receivedAmount: fundingLog.receivedAmount,
      baseCurrency: fundingLog.baseCurrency,
      status: fundingLog.status,
     },
    });
   }

   const contribution = await Contribution.create({
    campaignId: fundingLog.campaignId,
    contributorId: fundingLog.userId,
    amount: fundingLog.amountRequested,
    anonymous: false,
   });

   await Campaign.increment('raisedAmount', {
    by: fundingLog.amount,
    where: { id: fundingLog.campaignId },
   });
   return sendSuccess(res, 'Payment confirmed. Contribution recorded.', contribution, 200);
  }

  return res.status(400).json({ msg: 'Payment failed. Contribution not recorded.' });
 } catch (err) {
  console.error(err);
  res.status(500).json({ msg: 'Server error', error: err.message });
 }
};
