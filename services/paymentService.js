const paystackService = require('./providers/paystackService');
const flutterwaveService = require('./providers/flutterwaveService');
const stripeService = require('./providers/stripeService');
// Add more providers here

const providers = {
  paystack: paystackService,
  flutterwave: flutterwaveService,
  stripe: stripeService,
  // Add more as needed
};

exports.generatePaymentLink = async ({ providerKey, amount, user, campaign, transactionId, baseCurrency}) => {
  const provider = providers[providerKey];

  if (!provider || typeof provider.generatePaymentLink !== 'function') {
    throw new Error(`Payment provider "${providerKey}" not supported`);
  }

  return await provider.generatePaymentLink({ amount, user, campaign, transactionId, baseCurrency});
};
