const axios = require('axios');
const sgMail = require('@sendgrid/mail');

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

exports.sendOTPEmail = async ({ email, firstName, otp }, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
        const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL_FROM,
            subject: 'Your OTP Code',
            text: `Hello ${firstName},\n\nYour OTP code is ${otp}. It will expire in 5 minutes.\n\nBest regards,\nThe Crowdr Team`,
        };

        await sgMail.send(msg);
        if (res) {
            res.status(200).json({ msg: 'OTP sent to email' });
        }
    } catch (error) {
        console.error(error);
        if (res) {
            res.status(500).send('Error sending OTP email');
        }
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
