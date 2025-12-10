const { Contribution, FundingLog, Campaign, PaymentProvider } = require('../models');
const ApiError = require('../utils/api-error');

/**
 * Handles a webhook event from a payment provider and updates the funding log and contribution records accordingly.
 *
 * This function:
 * - Checks if the transaction with the given `systemTransactionId` has already been processed.
 * - Updates the funding log with the provider's transaction ID, status, and received amount.
 * - Detects mismatches between the requested and received amounts.
 * - If payment is successful and amounts match, it creates a Contribution record and updates the campaign's raised amount.
 * - If there's an amount mismatch, it returns a message indicating the need for manual review.
 *
 * @async
 * @function saveWebhookTransactionToDb
 * @param {Object} params - Transaction details from the webhook.
 * @param {string} params.systemTransactionId - The internal system's transaction ID.
 * @param {string} params.providerTransactionId - The transaction ID provided by the payment provider.
 * @param {number} params.receivedAmount - The amount received from the payment provider.
 * @param {string} params.status - The transaction status ('success' or other).
 * @param {string} paymentProvider - The name or identifier of the payment provider.
 * @returns {Promise<Object>} A message and related data depending on the outcome of the transaction processing.
 * @throws {ApiError} If the transaction has already been processed.
 * @throws {Error} For any database or runtime errors during the process.
 */
exports.saveWebhookTransactionToDb = async ({ systemTransactionId, providerTransactionId, receivedAmount, status }, paymentProvider) => {
 const provider = await PaymentProvider.findOne({
  where: {
   key: paymentProvider,
  },
 });

 if (!provider) {
  throw ApiError.notFound('Invalid payment provider. The given provider does not exist');
 }
 const fundingLog = await FundingLog.findOne({ where: { systemTransactionId } });

 if (fundingLog.status !== 'pending') {
  throw ApiError.badRequest('Transaction already processed');
 }

 try {
  fundingLog.providerTransactionId = providerTransactionId;
  fundingLog.status = status === 'success' ? 'successful' : 'pending';
  fundingLog.receivedAmount = receivedAmount;
  fundingLog.amountMismatch = receivedAmount !== parseFloat(fundingLog.amountRequested);
  if (fundingLog.amountRequested !== receivedAmount) {
   fundingLog.status = 'failed';
  }
  await fundingLog.save();

  if (fundingLog.status === 'successful') {
   if (fundingLog.amountMismatch) {
    console.log('Payment received but amount mismatch detected. Manual review required.');

    // res.status(200).json({
    //  message: 'Payment received but amount mismatch detected. Manual review required.',
    //  data: {
    //   id: fundingLog.id,
    //   campaignId: fundingLog.campaignId,
    //   userId: fundingLog.userId,
    //   amountRequested: fundingLog.amountRequested,
    //   requestCurrency: fundingLog.requestCurrency,
    //   receivedAmount: fundingLog.receivedAmount,
    //   baseCurrency: fundingLog.baseCurrency,
    //   status: fundingLog.status,
    //  },
    // });
   } else {
    await Contribution.create({
     campaign: fundingLog.campaignId,
     contributorId: fundingLog.userId,
     amount: fundingLog.receivedAmount,
     anonymous: !fundingLog.userId ? true : false,
     contributorEmail: fundingLog.contributorEmail,
    });

    await Campaign.increment('raisedAmount', {
     by: fundingLog.receivedAmount,
     where: { id: fundingLog.campaignId },
    });
   }
  }
 } catch (error) {
  throw error;
 }
};
