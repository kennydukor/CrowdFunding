const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateOTP, verifyOTP } = require('../utils/otpUtility'); // Import the OTP utility
const { sendOTPEmail } = require('./notificationController'); // Import the notification controller
const cloudinary = require('../utils/cloudinary');
const { sendSuccess, sendError, validatePassword } = require('../utils/general');
const { Interest, sequelize } = require('../models');

const OTP_EXPIRY_TIME = process.env.OTP_EXPIRY_TIME || 300000; // Default to 5 minutes

exports.getProfile = async (req, res) => {
 try {
  const user = await User.findByPk(req.userId, {
   attributes: {
    exclude: ['password', 'otp', 'otpExpire', 'resetPasswordToken', 'resetPasswordExpire'],
   },
  });

  if (!user) {
   return sendError(res, 'User not found', {
    errorCode: 'USER_NOT_FOUND',
    status: 404,
   });
  }

  return sendSuccess(res, 'Profile fetched successfully', user);
 } catch (err) {
  console.error('Get profile error:', err);
  return sendError(res, 'Failed to fetch profile');
 }
};

// exports.updateProfile = async (req, res) => {
//  const { firstName, middleName, lastName, bio, interests } = req.body;

//  try {
//   let user = await User.findByPk(req.userId);
//   if (!user) {
//    return sendError(res, 'User not found', {
//     errorCode: 'USER_NOT_FOUND',
//     status: 404,
//    });
//   }

//   // Handle profile picture replacement
//   if (req.file) {
//    if (user.profilePicture) {
//     const public_id = user.profilePicture.split('/').pop().split('.')[0];
//     await cloudinary.uploader.destroy(`profile_pictures/${public_id}`);
//    }
//    user.profilePicture = req.file.path;
//   }

//   user.firstName = firstName || user.firstName;
//   user.middleName = middleName || user.middleName;
//   user.lastName = lastName || user.lastName;
//   user.bio = bio || user.bio;

//   // Normalize interests
//   if (interests) {
//    user.interests = Array.isArray(interests) ? interests : interests.split(',').map((item) => item.trim());
//   }

//   await user.save();

//   // Sanitize response
//   const userResponse = user.toJSON();
//   delete userResponse.password;
//   delete userResponse.otp;
//   delete userResponse.otpExpire;
//   delete userResponse.resetPasswordToken;
//   delete userResponse.resetPasswordExpire;
//   delete userResponse.id;
//   delete userResponse.KYCDocument;
//   delete userResponse.otpRequestCount;
//   delete userResponse.otpRequestTimestamp;
//   delete userResponse.createdAt;
//   delete userResponse.updatedAt;

//   return sendSuccess(res, 'Profile updated successfully', userResponse);
//  } catch (err) {
//   console.error('Update profile error:', err);
//   return sendError(res, 'Failed to update profile');
//  }
// };

exports.updateProfile = async (req, res) => {
 const { firstName, middleName, lastName, bio, interests } = req.body;

 const transaction = await sequelize.transaction();

 try {
  const user = await User.findByPk(req.userId, { transaction });

  if (!user) {
   await transaction.rollback();
   return sendError(res, 'User not found', {
    errorCode: 'USER_NOT_FOUND',
    status: 404,
   });
  }

  // Handle profile picture replacement
  if (req.file) {
   if (user.profilePicture) {
    const public_id = user.profilePicture.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`profile_pictures/${public_id}`);
   }
   user.profilePicture = req.file.path;
  }

  // Update basic profile fields
  user.firstName = firstName ?? user.firstName;
  user.middleName = middleName ?? user.middleName;
  user.lastName = lastName ?? user.lastName;
  user.bio = bio ?? user.bio;

  await user.save({ transaction });

  if (interests !== undefined) {
   const interestIds = Array.isArray(interests)
    ? interests.map(Number)
    : String(interests)
       .split(',')
       .map((i) => Number(i.trim()));

   const validInterests = await Interest.findAll({
    where: { id: interestIds },
    transaction,
   });

   await user.setInterests(validInterests, { transaction });
  }

  await transaction.commit();

  // Reload user with interests
  const updatedUser = await User.findByPk(req.userId, {
   include: [{ model: Interest, through: { attributes: [] } }],
  });

  // Sanitize response
  const userResponse = updatedUser.toJSON();
  delete userResponse.password;
  delete userResponse.otp;
  delete userResponse.otpExpire;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpire;
  delete userResponse.KYCDocument;
  delete userResponse.otpRequestCount;
  delete userResponse.otpRequestTimestamp;
  delete userResponse.createdAt;
  delete userResponse.updatedAt;

  return sendSuccess(res, 'Profile updated successfully', userResponse);
 } catch (err) {
  await transaction.rollback();
  console.error('Update profile error:', err);
  return sendError(res, 'Failed to update profile');
 }
};

exports.changePassword = async (req, res) => {
 const { oldPassword, newPassword } = req.body;

 try {
  if (!validatePassword(newPassword)) {
   return sendError(res, 'Password does not meet complexity requirements', {
    errorCode: 'WEAK_PASSWORD',
    errors: ['Password must be at least 8 characters long, and include an uppercase letter, lowercase letter, number, and special character.'],
    status: 400,
   });
  }

  const user = await User.findByPk(req.userId);

  if (!user) {
   return sendError(res, 'User not found', {
    errorCode: 'USER_NOT_FOUND',
    status: 404,
   });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
   return sendError(res, 'Incorrect old password', {
    errorCode: 'INCORRECT_OLD_PASSWORD',
    status: 400,
   });
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
   return sendError(res, 'New password cannot be the same as the old password', {
    errorCode: 'SAME_AS_OLD_PASSWORD',
    status: 400,
   });
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, 'Password changed successfully');
 } catch (err) {
  console.error('Change password error:', err);
  return sendError(res, 'Failed to change password');
 }
};

exports.forgotPassword = async (req, res) => {
 const { email } = req.body;

 try {
  const user = await User.findOne({ where: { email } });

  if (!user) {
   return sendError(res, 'User not found', {
    errorCode: 'USER_NOT_FOUND',
    status: 404,
   });
  }

  const otp = generateOTP();
  const otpExpire = Date.now() + OTP_EXPIRY_TIME;

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  const otpResponse = await sendOTPEmail(user);

  if (!otpResponse.success) {
   return sendError(res, 'Failed to send OTP email', {
    errorCode: 'EMAIL_ERROR',
    errors: [otpResponse.error],
    status: 500,
   });
  }

  return sendSuccess(res, 'OTP sent for password reset');
 } catch (err) {
  console.error('Forgot Password error:', err);
  return sendError(res, 'Failed to initiate password reset');
 }
};

exports.resetPassword = async (req, res) => {
 const { email, otp, newPassword } = req.body;

 try {
  if (!validatePassword(newPassword)) {
   return sendError(res, 'Password does not meet complexity requirements', {
    errorCode: 'WEAK_PASSWORD',
    errors: ['Password must be at least 8 characters long, and include an uppercase letter, lowercase letter, number, and special character.'],
    status: 400,
   });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
   return sendError(res, 'User not found', {
    errorCode: 'USER_NOT_FOUND',
    status: 404,
   });
  }

  if (!verifyOTP(user, otp)) {
   return sendError(res, 'Invalid or expired OTP', {
    errorCode: 'INVALID_OTP',
    status: 400,
   });
  }

  user.password = newPassword;
  user.otp = null;
  user.otpExpire = null;

  await user.save();

  return sendSuccess(res, 'Password reset successfully');
 } catch (err) {
  console.error('Reset password error:', err);
  return sendError(res, 'Failed to reset password');
 }
};
