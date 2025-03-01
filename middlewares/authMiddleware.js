const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    
    // // Expect the HMAC of the request body in a custom header
    // const bodySignature = req.header('X-Body-Signature');
    // if (!bodySignature) {
    //     return res.status(401).json({ msg: 'No body signature provided' });
    // }
    
    try {
        // Verify the JWT using the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Recompute HMAC over the request body (assumed to be JSON)
        const computedSignature = crypto.createHmac('sha256', process.env.PAYLOAD_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');
            
        // // Compare the computed signature to the one provided by the client
        // if (computedSignature !== bodySignature) {
        //     return res.status(401).json({ msg: 'Request body integrity check failed' });
        // }
        
        // Attach the userId from the token to the request object
        req.userId = decoded.userId;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired, please log in again' });
        }
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
