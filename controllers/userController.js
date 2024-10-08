const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateOTP, verifyOTP } = require('../utils/otpUtility'); // Import the OTP utility
const { sendOTPEmail } = require('./notificationController'); // Import the notification controller

exports.updateProfile = async (req, res) => {
    const { firstName, middleName, lastName, bio, profilePicture, interests } = req.body;
    try {
        let user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.firstName = firstName || user.firstName;
        user.middleName = middleName || user.middleName;
        user.lastName = lastName || user.lastName;
        user.bio = bio || user.bio;
        user.profilePicture = profilePicture || user.profilePicture;
        user.interests = interests || user.interests;

        await user.save();
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect old password' });

        user.password = newPassword;

        await user.save();
        res.status(200).json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = generateOTP();
        const otpExpire = Date.now() + 300000; // 5 minutes

        user.otp = otp;
        user.otpExpire = otpExpire;

        await user.save();

        // Send OTP email for password reset
        await sendOTPEmail({ email, firstName: user.firstName, otp }, res);

        res.status(200).json({ msg: 'OTP sent for password reset' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending OTP');
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (!verifyOTP(user, otp)) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.password = newPassword;

        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save();
        res.status(200).json({ msg: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};