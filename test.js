// Example in JavaScript using Node's crypto module
const crypto = require('crypto');
const dotenv =require('dotenv')
dotenv.config()
// function computePayloadSignature(payload, secret) {
//     return crypto.createHmac('sha256', secret)
//         .update(JSON.stringify(payload))
//         .digest('hex');
// }
//
// // Assume you have the decoded payload and the secret is known (must match PAYLOAD_SECRET)
// const payloadSignature = computePayloadSignature({
//     "campaignId": "7",
//     "amount": 2500,
//     "paymentMethod": "card",
//     "requestCurrency": "NGN",
//     "paymentProviderId": 1
// },  process.env.PAYLOAD_SECRET);
// console.log(payloadSignature);
// Then send this signature in the header: X-Payload-Signature

fun