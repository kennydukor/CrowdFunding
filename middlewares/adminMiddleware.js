const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;
        if (req.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access only' });
        }
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = adminMiddleware;
