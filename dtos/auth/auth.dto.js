const Joi = require('joi');

function resetPasswordValidation(body) {
 const schema = Joi.object({
  password: Joi.string()
   .required()
   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
   .messages({
    'string.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.regex': 'Password must contain uppercase, special character and a number',
    'string.pattern.base': 'Password must contain uppercase, special character and a number',
   }),
  otp: Joi.string().required().max(6),
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
 resetPasswordValidation,
};
