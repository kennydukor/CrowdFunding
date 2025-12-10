const { FundingLog, PaymentProvider, Contribution, Campaign, User } = require('../models');
const sequelize = require('../utils/db'); // Ensure transactions are handled properly (atomic operations)
const axios = require('axios');
const { sendEmailNotification, sendContributionNotificationToOwner, sendContributionConfirmationToContributor } = require('./notificationController'); // Import the notification controller
const { generatePaymentLink, anonymousPaymentLink } = require('../services/paymentService');
const { sendSuccess } = require('../utils/general');
const { saveWebhookTransactionToDb } = require('../services/webhooksService');
const crypto = require('crypto');
const { validateAnonymousPayment, validatePaymentInit } = require('../dtos/payment/payment.dto');
const ApiError = require('../utils/api-error');
const Campaigns = require('../models/Campaign');

exports.initiatePayment = async (req, res, next) => {
 //run validation
 const { error, value } = validatePaymentInit(req.body);

 if (error) {
  const messages = error.details.map((err) => err.message);
  return next(
   ApiError.validationError({
    data: messages,
   }),
  );
 }

 let { campaignId, amount, requestCurrency, paymentMethod, paymentProviderId } = value;
 try {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
   return next(ApiError.notFound('Could not find any record for the given campaign data.'));
  }

  // 🔒 Ensure campaign is active and approved
  if (!campaign.isComplete || campaign.status !== 'approved') {
   return res.status(400).json({
    msg: 'This campaign is not open for contributions. It must be approved and active.',
   });
  }

  // const user = await User.findByPk(req.userId);
  // if (!user) return res.status(404).json({ msg: 'User not found' });

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
  // res.status(500).json({ msg: 'Server error', error: err.message });
  next(err);
 }
};

exports.verifyPaystackTransactionUsingWebhook = async (req, res, next) => {
 try {
  const paystackSignature = req.headers['x-paystack-signature'];

  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

  if (hash === paystackSignature) {
   const event = req.body;

   let systemTransactionId, providerTransactionId, receivedAmount, status;
   if (event.event === 'charge.success') {
    systemTransactionId = event.data.reference;
    providerTransactionId = event.data.id;
    receivedAmount = parseFloat(event.data.amount) / 100;
    status = event.data.status;

    await saveWebhookTransactionToDb(
     {
      systemTransactionId,
      providerTransactionId,
      receivedAmount,
      status,
     },
     'paystack',
    );
   }

   return res.sendStatus(200);
  }

  return res.sendStatus(200);
 } catch (error) {
  return next(error);
 }
};

exports.verifyFlutterwaveTransactionUsingWebhook = async (req, res, next) => {
 try {
  const flutterwaveSignature = req.headers['flutterwave-signature'];
  const isValid = isValidFlutterwaveWebhook(req.rawBody, flutterwaveSignature, process.env.FLW_SECRET_HASH);

  if (!isValid) {
   return res.status(401).send('Invalid signature');
  }

  let systemTransactionId, providerTransactionId, receivedAmount, status;

  systemTransactionId = req.body.data.txRef;
  providerTransactionId = req.body.data.id;
  receivedAmount = parseFloat(req.body.data.amount);
  status = req.body.status === 'succeeded' ? 'successful' : 'failed';
  await saveWebhookTransactionToDb(
   {
    systemTransactionId,
    providerTransactionId,
    receivedAmount,
    status,
   },
   'flutterwave',
  );

  return res.send(200);
 } catch (error) {
  return next(error);
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

exports.getContributionsByUser = async (req, res, next) => {
 try {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  const contributions = await Contribution.findAll({
   limit: pageSize,
   offset: offset,
   attributes: {
    exclude: ['contributorEmail', 'contributorId'],
   },
   include: [
    {
     model: Campaigns,
     where: { owner: req.userId },
     attributes: [],
    },
    {
     model: User,
     attributes: ['firstName', 'lastName'],
    },
   ],
  });

  const totalContributions = await Campaigns.count({
   where: { owner: req.userId },
  });
  const totalPages = Math.ceil(totalContributions / pageSize);

  res.json({
   data: contributions,
   message: 'Data retrieved successfully',
   pagination: {
    page,
    pageSize,
    totalContributions,
    totalPages,
   },
  });
 } catch (err) {
  return next(err);
 }
};

exports.handlePaystackCallbackVerification = async (req, res, next) => {
 const { reference } = req.query;
 if (!reference) {
  return next(ApiError.badRequest('No reference found in request'));
 }
 try {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
   headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
   },
  });
  console.log(response);

  const paymentProvider = await PaymentProvider.findOne({
   where: {
    key: 'paystack',
   },
  });

  if (!paymentProvider) {
   return next(ApiError.badRequest('Invalid payment provider'));
  }

  // let systemTransactionId, providerTransactionId, receivedAmount, status;

  const event = response.data?.data,
   systemTransactionId = event.reference,
   providerTransactionId = event.id,
   status = event.status,
   receivedAmount = parseFloat(event.amount) / 100; // Convert kobo to naira

  const fundingLog = await FundingLog.findOne({
   where: { systemTransactionId },
   include: [
    {
     model: Campaign,
     include: [
      {
       model: User, // Include the campaign owner (User)
       //  as: 'owner',
      },
     ],
    },
   ],
  });

  if (!fundingLog) {
   return next(ApiError.badRequest('Transaction not found'));
  }

  // if (fundingLog.status !== 'pending') {
  //  throw ApiError.badRequest('Transaction already processed');
  // }

  fundingLog.providerTransactionId = providerTransactionId;
  fundingLog.status = status === 'success' ? 'successful' : 'pending';
  fundingLog.receivedAmount = receivedAmount;
  fundingLog.amountMismatch = receivedAmount !== parseFloat(fundingLog.amountRequested);

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

   console.log(fundingLog.Campaign);

   //  await Contribution.create({
   //   campaign: fundingLog.campaignId,
   //   contributorId: fundingLog.userId,
   //   amount: fundingLog.amountRequested,
   //   anonymous: !fundingLog.userId ? true : false,
   //   contributorEmail: fundingLog.contributorEmail,
   //  });
   //  await fundingLog.save();

   //  await Campaign.increment('raisedAmount', {
   //   by: parseFloat(fundingLog.receivedAmount),
   //   where: { id: fundingLog.campaignId },
   //  });

   await sendContributionNotificationToOwner(fundingLog.Campaign.User, fundingLog.Campaign.title, fundingLog.amountRequested, fundingLog.requestCurrency);

   // 2. Send confirmation to the anonymous contributor (if email exists)
   if (fundingLog.contributorEmail && fundingLog.isAnonymous) {
    await sendContributionConfirmationToContributor(fundingLog.contributorEmail, fundingLog.Campaign.title, fundingLog.amountRequested, fundingLog.requestCurrency);
   }
   return sendSuccess(res, 'Payment confirmed. Contribution recorded.', {}, 200);
  }

  return res.status(400).json({ msg: 'Payment failed. Contribution not recorded.' });
 } catch (err) {
  console.error(err);
  return next(err);
 }
};

function isValidFlutterwaveWebhook(rawBody, signature, secretHash) {
 const hash = crypto.createHmac('sha256', secretHash).update(rawBody).digest('base64');

 return hash === signature;
}

/**
------------Anonymous contributions
 */

exports.initiateAnonymousPayment = async (req, res, next) => {
 //run validation
 console.log(req.body);
 const { error, value } = validateAnonymousPayment(req.body);

 if (error) {
  const messages = error.details.map((err) => err.message);
  return next(
   ApiError.validationError({
    data: messages,
   }),
  );
 }

 let { campaignId, amount, requestCurrency, paymentMethod, paymentProviderId, email } = value;
 try {
  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
   return next(ApiError.notFound('Could not find any record for the given campaign data.'));
  }

  if (!campaign.isComplete || campaign.status !== 'approved') {
   return res.status(400).json({
    msg: 'This campaign is not open for contributions. It must be approved and active.',
   });
  }

  const paymentProvider = await PaymentProvider.findByPk(paymentProviderId);
  if (!paymentProvider) return next(ApiError.badRequest('Invalid payment provider.'));

  const systemTransactionId = `sys_a_${Date.now()}`;

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

  const checkoutInfo = await anonymousPaymentLink({
   providerKey: paymentProvider.key,
   amount,
   currency: requestCurrency,
   email,
   campaignId,
   transactionId: systemTransactionId,
  });

  await FundingLog.create({
   campaignId,
   userId: null,
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
    userEmail: email,
    campaignTitle: campaign.title,
    checkoutInfo: checkoutInfo,
   },
   isAnonymous: true,
   contributorEmail: email,
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
  next(err);
 }
};
