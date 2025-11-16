const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendError } = require('../utils/general');

const authMiddleware = (req, res, next) => {
 const authHeader = req.header('Authorization');
 if (!authHeader) {
  return sendError(res, 'No token, authorization denied', {
   errorCode: 'NO_AUTH_HEADER',
   status: 401,
  });
 }

 const token = authHeader.split(' ')[1];
 if (!token) {
  return sendError(res, 'No token, authorization denied', {
   errorCode: 'NO_TOKEN',
   status: 401,
  });
 }

 // // Expect the HMAC of the request body in a custom header
 //  const bodySignature = req.header('X-Body-Signature');
 //  if (!bodySignature) {
 //   return sendError(res, 'No body signature provided', {
 //    errorCode: 'NO_BODY_SIGNATURE',
 //    status: 401,
 //   });
 //  }

 try {
  // Verify the JWT using the secret
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // // Recompute HMAC over the request body (assumed to be JSON)
  // const computedSignature = crypto.createHmac('sha256', process.env.PAYLOAD_SECRET)
  //     .update(JSON.stringify(req.body))
  //     .digest('hex');

  // // // Compare the computed signature to the one provided by the client
  // if (computedSignature !== bodySignature) {
  //     return sendError(res, 'Request body integrity check failed', {
  //         errorCode: 'INVALID_BODY_SIGNATURE',
  //         status: 401
  //     });
  // }
  //
  // Attach the userId from the token to the request object
  req.userId = decoded.userId;
  next();
 } catch (err) {
  console.log(err);
  if (err.name === 'TokenExpiredError') {
   return sendError(res, 'Token has expired, please log in again', {
    errorCode: 'TOKEN_EXPIRED',
    status: 401,
   });
  }

  return sendError(res, 'Token is not valid', {
   errorCode: 'INVALID_TOKEN',
   status: 401,
  });
 }
};

module.exports = authMiddleware;
