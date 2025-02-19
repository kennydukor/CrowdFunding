const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateOTP, verifyOTP } = require('../utils/otpUtility'); // Import the OTP utility
const { sendOTPEmail } = require('./notificationController'); // Import the notification controller
const cloudinary = require('../utils/cloudinary');

const OTP_EXPIRY_TIME = process.env.OTP_EXPIRY_TIME || 300000; // Default to 5 minutes

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            // Exclude sensitive fields in attributes or by removing them before send
            attributes: { exclude: ['password', 'otp', 'otpExpire', 'resetPasswordToken', 'resetPasswordExpire'] },
          });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.updateProfile = async (req, res) => {
    const { firstName, middleName, lastName, bio, interests } = req.body;
    try {
        let user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Handle Profile Picture Upload (Square Cropped)
        if (req.file) {
            // Before uploading the new profile picture, delete the old one if exists
            if (user.profilePicture) {
                const public_id = user.profilePicture.split('/').pop().split('.')[0]; // Get the public_id from the URL
                await cloudinary.uploader.destroy(`profile_pictures/${public_id}`); // Destroy the old image
            }

            user.profilePicture = req.file.path; // Already transformed and uploaded by the middleware
        }
        
        user.firstName = firstName || user.firstName;
        user.middleName = middleName || user.middleName;
        user.lastName = lastName || user.lastName;
        user.bio = bio || user.bio;
        
        // Ensure interests is always an array
        if (interests) {
            user.interests = Array.isArray(interests) ? interests : interests.split(',').map(item => item.trim());
        }
        await user.save();

        // Remove sensitive fields before returning the response
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.otpExpire;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;

        res.status(200).json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect old password' });

        // Check if the new password is the same as the old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) return res.status(400).json({ msg: 'New password cannot be the same as the old password' });

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
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = generateOTP();
        const otpExpire = Date.now() + OTP_EXPIRY_TIME;

        user.otp = otp;
        user.otpExpire = otpExpire;

        await user.save();

       // Send OTP email and check if it was successful
        const otpResponse = await sendOTPEmail(user);

        if (!otpResponse.success) {
            return res.status(500).json({ msg: otpResponse.error });
        }
        res.status(200).json({ msg: 'OTP sent for password reset' });
    } catch (err) {
        console.error('Forgot Password error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
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