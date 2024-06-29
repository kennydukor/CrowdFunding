const crypto = require('crypto');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

const verifyOTP = (user, otp) => {
    if (user.otp !== otp || Date.now() > user.otpExpire) {
        return false;
    }
    return true;
};

module.exports = {
    generateOTP,
    verifyOTP,
};
