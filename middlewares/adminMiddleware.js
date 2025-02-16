const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const adminMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Expect the body signature to be provided in this header
    const bodySignature = req.header('X-Body-Signature');
    if (!bodySignature) {
        return res.status(401).json({ msg: 'No body signature provided' });
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
            return res.status(401).json({ msg: 'Request body integrity check failed' });
        }

        // Attach decoded values to the request
        req.userId = decoded.userId;
        req.role = decoded.role;

        // Ensure the user has admin role
        if (req.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access only' });
        }

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired, please log in again' });
        }
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = adminMiddleware;
