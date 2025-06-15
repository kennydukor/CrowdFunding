const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP, verifyOTP } = require('../utils/otpUtility');
const { sendOTPEmail, sendWelcomeEmail } = require('./notificationController');
const Interest = require('../models/Interest');
const { sendSuccess, sendError, validatePassword} = require('../utils/general');
const { Op } = require('sequelize');


const OTP_EXPIRY_TIME = process.env.OTP_EXPIRY_TIME || 300000; // Default to 5 minutes

exports.signup = async (req, res) => {
    const { email, password, firstName, middleName, lastName, gender, organizationName, userType, interests, role } = req.body;
    try {
        if (!validatePassword(password)) {
            return sendError(res, 'Password does not meet complexity requirements', {
                errorCode: 'WEAK_PASSWORD',
                errors: [
                    'Password must be at least 8 characters long, and include an uppercase letter, lowercase letter, number, and special character.'
                ],
                status: 400
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return sendError(res, 'User already exists', {
                errorCode: 'DUPLICATE_USER',
                status: 409
            });
        }

        const otp = generateOTP();
        const otpExpire = Date.now() + OTP_EXPIRY_TIME;

        const newUser = await User.create({
            email,
            password,
            firstName,
            middleName,
            lastName,
            gender,
            organizationName: userType === 'Individual' ? null : organizationName || null,
            userType,
            role,
            otp,
            otpExpire,
          });

        // Associate interests using the join table. This should be an array of interest IDs
        if (Array.isArray(interests) && interests.length > 0) {
        await newUser.setInterests(interests); // Sequelize magic method for many-to-many
        }

        // Send OTP email and check if it was successful
        const otpResponse = await sendOTPEmail(newUser);
        if (!otpResponse.success) {
            return sendError(res, 'Failed to send OTP email', {
                errorCode: 'EMAIL_ERROR',
                errors: [otpResponse.error],
                status: 500
            });
        }
        return sendSuccess(res, 'OTP sent to email', null, 201);
    } catch (err) {
        console.error('Signup error:', err);

        if (err.name === 'SequelizeValidationError') {
            return sendError(res, 'Validation error', {
                errorCode: 'VALIDATION_ERROR',
                errors: err.errors.map(e => e.message),
                status: 400
            });
        }

        if (err.name === 'SequelizeDatabaseError') {
            return sendError(res, 'Database error', {
                errorCode: 'DB_ERROR',
                errors: [err.message],
                status: 400
            });
        }

        return sendError(res, 'Unexpected server error');
    }
};

exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendError(res, 'User not found', {
                errorCode: 'USER_NOT_FOUND',
                status: 404
            });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return sendError(res, 'User is already verified', {
                errorCode: 'ALREADY_VERIFIED',
                status: 409
            });
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
            return sendError(res, 'Failed to resend OTP email', {
                errorCode: 'EMAIL_ERROR',
                errors: [otpResponse.error],
                status: 500
            });
        }
        return sendSuccess(res, 'OTP resent successfully. Please check your email.');
    } catch (err) {
        console.error('Resend OTP error:', err);

        if (err.name === 'SequelizeValidationError') {
            return sendError(res, 'Validation error', {
                errorCode: 'VALIDATION_ERROR',
                errors: err.errors.map(e => e.message),
                status: 400
            });
        }

        return sendError(res, 'Unexpected server error');
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendError(res, 'User not found', {
                errorCode: 'USER_NOT_FOUND',
                status: 404
            });
        }

        if (user.isVerified) {
            return sendError(res, 'Email is already verified', {
                errorCode: 'ALREADY_VERIFIED',
                status: 409
            });
        }

        if (!verifyOTP(user, otp)) {
            return sendError(res, 'Invalid or expired OTP', {
                errorCode: 'INVALID_OTP',
                status: 401
            });
        }

        user.otp = null;
        user.otpExpire = null;
        user.isVerified = true;
        await user.save();

        // ✅ Send a welcome email after successful verification
        const welcomeResponse = await sendWelcomeEmail(user);
        if (!welcomeResponse.success) {
            console.error('Failed to send welcome email:', welcomeResponse.error);
        }
        return sendSuccess(res, 'Email verified successfully');
    } catch (err) {
        console.error('Verify OTP error:', err);

        if (err.name === 'SequelizeValidationError') {
            return sendError(res, 'Validation error', {
                errorCode: 'VALIDATION_ERROR',
                errors: err.errors.map(e => e.message),
                status: 400
            });
        }

        return sendError(res, 'Unexpected server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return sendError(res, 'Invalid credentials', {
                errorCode: 'AUTH_FAILED',
                status: 401
            });
        }

        if (!user.isVerified) {
            return sendError(res, 'Please verify your email before logging in', {
                errorCode: 'EMAIL_NOT_VERIFIED',
                status: 403
            });
        }

        if (user.status === 'blocked') {
            return sendError(res, 'Your account has been blocked. Please contact support.', {
                errorCode: 'ACCOUNT_BLOCKED',
                status: 403
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 'Invalid credentials', {
                errorCode: 'AUTH_FAILED',
                status: 401
            });
        }

        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

        return sendSuccess(res, 'Login successful', {
            token,
            user: {
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);

        return sendError(res, 'Unexpected server error');
    }
};

exports.deleteUnverifiedUsers = async (req, res) => {
    const expirationTime = Date.now() - 60 * 24 * 60 * 60 * 1000; // 60 days ago
    try {
        const deletedCount = await User.destroy({
            where: {
                isVerified: false,
                createdAt: { [Op.lt]: expirationTime }
            }
        });

        return sendSuccess(res, `Deleted ${deletedCount} unverified user(s).`);
    } catch (err) {
        console.error('Error deleting unverified users:', err);
        return sendError(res, 'Failed to delete unverified users');
    }
};

exports.getInterests = async (req, res) => {
  try {
    const interests = await Interest.findAll({
      attributes: ['id', 'label', 'description']
    });
    return sendSuccess(res, 'Interests fetched successfully', interests);
  } catch (err) {
    console.error('Error fetching interests:', err);
    return sendError(res, 'Failed to fetch interests');
  }
};