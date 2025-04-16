const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP, verifyOTP } = require('../utils/otpUtility');
const { sendOTPEmail, sendWelcomeEmail } = require('./notificationController');

// const generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
// };

const OTP_EXPIRY_TIME = process.env.OTP_EXPIRY_TIME || 300000; // Default to 5 minutes

exports.signup = async (req, res) => {
    const { email, password, firstName, middleName, lastName, gender, organizationName, userType, interests, role } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user) return res.status(409).json({ msg: 'User already exists' });

        const otp = generateOTP();
        const otpExpire = Date.now() + OTP_EXPIRY_TIME;

        const newUser = await User.create({
            email,
            password,
            firstName,
            middleName,
            lastName,
            gender,
            organizationName,
            userType,
            interests,  // store as JSON/array if your model allows
            role,
            otp,
            otpExpire,
          });

        // Send OTP email and check if it was successful
        const otpResponse = await sendOTPEmail(newUser);
        if (!otpResponse.success) {
            return res.status(500).json({ msg: otpResponse.error });
        }
        res.status(201).json({ msg: 'OTP sent to email' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).send('Server error');
    }
};

exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(409).json({ msg: 'User is already verified' });
        }

        // Generate a new OTP and set its expiration time
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpire = Date.now() + OTP_EXPIRY_TIME;

        // Save the updated user
        await user.save();

        // Resend the OTP email and check if it was successful
        const otpResponse = await sendOTPEmail(user);

        if (!otpResponse.success) {
            return res.status(500).json({ msg: otpResponse.error });
        }
        res.status(200).json({ msg: 'OTP resent successfully. Please check your email.' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).send('Server error');
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.isVerified) {
            return res.status(409).json({ msg: 'Email is already verified' });
        }

        if (!verifyOTP(user, otp)) {
            return res.status(401).json({ msg: 'Invalid or expired OTP' });
        }

        user.otp = undefined;
        user.otpExpire = undefined;
        user.isVerified = true;
        await user.save();

        // ✅ Send a welcome email after successful verification
        const welcomeResponse = await sendWelcomeEmail(user);
        if (!welcomeResponse.success) {
            console.error('Failed to send welcome email:', welcomeResponse.error);
        }
        res.status(200).json({ msg: 'Email verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Please verify your email before logging in' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({ token, 
            user: {
                userId: user.id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                role: user.role
            } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.deleteUnverifiedUsers = async (req, res) => {
    const expirationTime = Date.now() - 60 * 24 * 60 * 60 * 1000; // 60 days ago
    try {
        const result = await User.deleteMany({ isVerified: false, createdAt: { $lt: expirationTime } });
        res.status(200).json({ msg: `Deleted ${result.deletedCount} unverified users.` });
    } catch (err) {
        console.error('Error deleting unverified users:', err);
        res.status(500).send('Server error');
    }
};

