const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

const OTP_REQUEST_LIMIT = 3;  // Max OTP requests within time window
const OTP_TIME_WINDOW = 10 * 60 * 1000;  // 10 minutes in milliseconds

exports.sendEmailNotification = async ({ to, subject, text }, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const msg = {
            to,
            from: process.env.SENDGRID_EMAIL_FROM,
            subject,
            text,
        };

        await sgMail.send(msg);
        if (res) {
            res.status(200).json({ msg: 'Email sent successfully' });
        }
    } catch (error) {
        console.error(error);
        if (res) {
            res.status(500).send('Error sending email');
        }
    }
};

exports.sendOTPEmail = async (user) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const currentTime = Date.now();

        // Check if user has exceeded OTP requests within the time window
        if (user.otpRequestTimestamp && (currentTime - user.otpRequestTimestamp < OTP_TIME_WINDOW)) {
            if (user.otpRequestCount >= OTP_REQUEST_LIMIT) {
                return { success: false, error: 'Too many OTP requests. Please try again later.' };
            }
        } else {
            // Reset count if outside the time window
            user.otpRequestCount = 0;
        }

        // Increase the counter and update timestamp
        user.otpRequestCount += 1;
        user.otpRequestTimestamp = currentTime;

        // Save the user with updated OTP fields
        await user.save();

        const msg = {
            to: user.email,
            from: process.env.SENDGRID_EMAIL_FROM,
            subject: 'Your OTP Code',
            text: `Hello ${user.firstName},\n\nYour OTP code is ${user.otp}. It will expire in 5 minutes.\n\nBest regards,\nThe Raizefund Team`,
        };

        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: 'Error sending OTP email' };
    }
};

exports.sendWelcomeEmail = async (user) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_EMAIL_FROM,
            subject: 'Welcome to Raizefund!',
            text: `Hello ${user.firstName},\n\nWelcome to Raizefund! We're excited to have you onboard.\n\nBest regards,\nThe Raizefund Team`,
        };

        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: 'Error sending welcome email' };
    }
};

// Send SMS notification
exports.sendSMSNotification = async (req, res) => {
    const { to, message } = req.body;
    try {
        // Use an SMS service like Twilio
        const response = await axios.post('https://api.twilio.com/2010-04-01/Accounts/{AccountSID}/Messages.json', {
            to,
            from: process.env.TWILIO_PHONE_NUMBER,
            body: message,
        }, {
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
            },
        });

        res.status(200).json({ msg: 'SMS sent successfully', response: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending SMS');
    }
};

// Send push notification
exports.sendPushNotification = async (req, res) => {
    const { deviceToken, title, body } = req.body;
    try {
        // Use a push notification service like Firebase Cloud Messaging (FCM)
        const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
            to: deviceToken,
            notification: {
                title,
                body,
            },
        }, {
            headers: {
                Authorization: `key=${process.env.FCM_SERVER_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).json({ msg: 'Push notification sent successfully', response: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending push notification');
    }
};
