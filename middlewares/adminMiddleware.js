const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {sendError} = require('../utils/general');

const adminMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return sendError(res, 'No token, authorization denied', {
            errorCode: 'NO_AUTH_HEADER',
            status: 401
        });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return sendError(res, 'No token, authorization denied', {
            errorCode: 'NO_TOKEN',
            status: 401
        });
    }

    // Expect the body signature to be provided in this header
    const bodySignature = req.header('X-Body-Signature');
    if (!bodySignature) {
        return sendError(res, 'No body signature provided', {
            errorCode: 'NO_BODY_SIGNATURE',
            status: 401
        });
    }

    try {
        // Verify the token first
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Compute an HMAC over the request body (assume it's JSON)
        const computedSignature = crypto
            .createHmac('sha256', process.env.PAYLOAD_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        // Compare the computed signature with the one provided by the client
        if (computedSignature !== bodySignature) {
            return sendError(res, 'Request body integrity check failed', {
                errorCode: 'INVALID_BODY_SIGNATURE',
                status: 401
            });
        }

        // Attach decoded values to the request
        req.userId = decoded.userId;
        req.role = decoded.role;

        // Ensure the user has admin role
        if (req.role !== 'admin') {
            return sendError(res, 'Admin access only', {
                errorCode: 'FORBIDDEN',
                status: 403
            });
        }

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 'Token has expired, please log in again', {
                errorCode: 'TOKEN_EXPIRED',
                status: 401
            });
        }

        return sendError(res, 'Token is not valid', {
            errorCode: 'INVALID_TOKEN',
            status: 401
        });
    }
};

module.exports = adminMiddleware;
