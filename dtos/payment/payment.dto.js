const Joi = require('joi');

function validatePaymentInit(body) {
 const schema = Joi.object({
  campaignId: Joi.number().required(),
  amount: Joi.string().required(),
  requestCurrency: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  paymentProviderId: Joi.string().required(),
 });

 return schema.validate(body, {
  abortEarly: false,
 });
}

function validateAnonymousPayment(body) {
 const schema = Joi.object({
  campaignId: Joi.number().required(),
  amount: Joi.string().required(),
  requestCurrency: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  paymentProviderId: Joi.string().required(),
  email: Joi.string().email().required().messages({
   'string.email': 'An email address is required to make an anonymous contribution. We use it only to send you updates about your contribution. Your email will not be shared with the recipient or made public.',
   'string.empty': 'Email is required.',
   'any.required': 'Email is required.',
  }),
 });

 return schema.validate(body, {
  abortEarly: false,
 });
}

module.exports = {
 validateAnonymousPayment,
 validatePaymentInit,
};
