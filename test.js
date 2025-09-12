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

// function computePayloadSignature(payload, secret){
//     return crypto
//         .createHmac("sha512", secret)
//         .update(JSON.stringify(payload))
//         .digest("hex");
// }
// const payloadSignature = computePayStakSignature({
//     "reference":sys_1757450267763  ,
//     "amount": 2500,
//     "id": "card",
//     "status":,
// },  process.env.PAYLOAD_SECRET);
// console.log(payloadSignature);
const paystack_secret = process.env.PAYSTACK_SECRET_KEY
const payload = JSON.stringify({
    event: "charge.success",
    data: {
        reference: 'sys_1757456322912',
        amount: 2500,
        status: "success"
    }
});

const signature = crypto
    .createHmac("sha512", paystack_secret)
    .update(payload)
    .digest("hex");

console.log("x-paystack-signature:", signature);