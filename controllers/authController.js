const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP, verifyOTP } = require('../utils/otpUtility'); // Import the OTP utility

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

exports.signup = async (req, res) => {
    const { email, password, firstName, middleName, lastName, gender, organizationName, userType, interests, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const otp = generateOTP();
        const otpExpire = Date.now() + 300000; // 5 minutes

        user = new User({ email, password, firstName, middleName, lastName, gender, organizationName, userType, interests, role, otp, otpExpire });
        await user.save();

        // Send OTP email
        await sendOTPEmail({ email, firstName, otp }, res);

        res.status(201).json({ msg: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (!verifyOTP(user, otp)) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.otp = undefined;
        user.otpExpire = undefined;
        user.isVerified = true;

        await user.save();
        res.status(200).json({ msg: 'Email verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, userId: user._id, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
