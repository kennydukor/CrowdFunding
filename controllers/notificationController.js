const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');
const User = require('../models/User');
const htmlToText = require('html-to-text');
const handlebars = require('handlebars');
require('dotenv').config();

const OTP_REQUEST_LIMIT = 3;
const OTP_TIME_WINDOW = 10 * 60 * 1000;

const useSMTP = process.env.MAIL_PROVIDER === 'smtp';
const useSendGrid = process.env.MAIL_PROVIDER === 'sendgrid';

// Configure SendGrid (if selected)
if (useSendGrid && process.env.SENDGRID_API_KEY) {
 sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure SMTP (if selected)
let transporter = null;
if (useSMTP) {
 transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
  auth: {
   user: process.env.SMTP_USER,
   pass: process.env.SMTP_PASS,
  },
 });
}

// General email sender
async function sendEmail({ to, subject, html, text }) {
 try {
  if (useSendGrid) {
   const msg = {
    to,
    from: process.env.SENDGRID_EMAIL_FROM,
    subject,
    text,
   };
   await sgMail.send(msg);
  } else if (useSMTP && transporter) {
   await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    text,
   });
  } else {
   throw new Error('No valid email provider configured');
  }
  return { success: true };
 } catch (error) {
  console.error('Error sending email:', error);
  return { success: false, error: error.message };
 }
}

// Send OTP email
exports.sendOTPEmail = async (user) => {
 try {
  const currentTime = Date.now();

  // Limit OTP requests within 10 minutes
  if (user.otpRequestTimestamp && currentTime - user.otpRequestTimestamp < OTP_TIME_WINDOW) {
   if (user.otpRequestCount >= OTP_REQUEST_LIMIT) {
    return {
     success: false,
     error: 'Too many OTP requests. Please try again later.',
    };
   }
  } else {
   user.otpRequestCount = 0;
  }

  // Update request count and timestamp
  user.otpRequestCount += 1;
  user.otpRequestTimestamp = currentTime;
  await user.save();

  const { text, html } = this.renderTemplate('verify-account.mail', {
   firstName: user.firstName,
   otp: user.otp,
   year: new Date().getFullYear(),
  });
  const emailContent = {
   to: user.email,
   subject: 'Your OTP Code',
   text,
   html,
   // text: `Hello ${user.firstName},\n\nYour OTP code is ${user.otp}. It will expire in 5 minutes.\n\nBest regards,\nThe Raizefund Team`,
  };

  return await sendEmail(emailContent);
 } catch (error) {
  console.error('Error sending OTP email:', error);
  return { success: false, error: 'Error sending OTP email' };
 }
};

// Send Welcome Email
exports.sendWelcomeEmail = async (user) => {
 try {
  const { text, html } = this.renderTemplate('welcome.mail', {
   firstName: user.firstName,
   loginUrl: 'https://raizefund.com/login',
   year: new Date().getFullYear(),
  });

  const emailContent = {
   to: user.email,
   subject: 'Welcome to Raizefund!',
   text,
   html,
  };

  return await sendEmail(emailContent);
 } catch (error) {
  console.error('Error sending welcome email:', error);
  return { success: false, error: 'Error sending welcome email' };
 }
};

// Send general email notification
exports.sendEmailNotification = async ({ to, subject, text }, res) => {
 const result = await sendEmail({ to, subject, text });
 if (res) {
  if (result.success) {
   return res.status(200).json({ msg: 'Email sent successfully' });
  } else {
   return res.status(500).json({ error: result.error });
  }
 }
};

// Send SMS notification
exports.sendSMSNotification = async (req, res) => {
 const { to, message } = req.body;
 try {
  const response = await axios.post(
   `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
   {
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: message,
   },
   {
    auth: {
     username: process.env.TWILIO_ACCOUNT_SID,
     password: process.env.TWILIO_AUTH_TOKEN,
    },
   },
  );

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
  const response = await axios.post(
   'https://fcm.googleapis.com/fcm/send',
   {
    to: deviceToken,
    notification: { title, body },
   },
   {
    headers: {
     Authorization: `key=${process.env.FCM_SERVER_KEY}`,
     'Content-Type': 'application/json',
    },
   },
  );

  res.status(200).json({
   msg: 'Push notification sent successfully',
   response: response.data,
  });
 } catch (error) {
  console.error(error);
  res.status(500).send('Error sending push notification');
 }
};

exports.renderTemplate = (templateName, context = {}) => {
 const templatePath = path.join(process.cwd(), 'views', 'mail', `${templateName}.hbs`);
 const source = fs.readFileSync(templatePath, 'utf8');
 const compiledTemplate = handlebars.compile(source);
 const html = compiledTemplate(context);
 return { html, text: htmlToText.htmlToText(html) };
};

exports.sendContributionNotificationToOwner = async (campaignOwner, campaignTitle, contributionAmount, currency) => {
 try {
  const amount = parseFloat(contributionAmount);
  const formattedNumber = amount.toLocaleString('en-US', { useGrouping: true });

  const { text, html } = this.renderTemplate('received-anonymous-contributions.mail', {
   campaignOwnerName: campaignOwner.firstName,
   campaignTitle: campaignTitle,
   contributionAmount: formattedNumber,
   currency: currency,
   year: new Date().getFullYear(),
  });

  const emailContent = {
   to: campaignOwner.email,
   subject: `Anonymous Contribution to Your Campaign "${campaignTitle}"`,
   text,
   html,
  };

  return await sendEmail(emailContent);
 } catch (error) {
  console.error('Error sending anonymous contribution notification to campaign owner:', error);
  return { success: false, error: 'Error sending campaign owner notification email' };
 }
};

exports.sendContributionConfirmationToContributor = async (contributorEmail, campaignTitle, contributionAmount, currency) => {
 try {
  const amount = parseFloat(contributionAmount);
  const formattedNumber = amount.toLocaleString('en-US', { useGrouping: true });

  const { text, html } = this.renderTemplate('anonymous-notification.mail', {
   campaignTitle: campaignTitle,
   contributionAmount: formattedNumber,
   currency: currency,
   year: new Date().getFullYear(),
  });

  const emailContent = {
   to: contributorEmail,
   subject: `Thank You for Your Contribution to "${campaignTitle}"`,
   text,
   html,
  };

  return await sendEmail(emailContent);
 } catch (error) {
  console.error('Error sending anonymous contribution confirmation to contributor:', error);
  return { success: false, error: 'Error sending contributor confirmation email' };
 }
};
