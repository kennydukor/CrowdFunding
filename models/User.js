const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  firstName: {
    type: DataTypes.STRING,
  },
  middleName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
  },
  organizationName: {
    type: DataTypes.STRING,
  },
  userType: {
    type: DataTypes.ENUM('Individual', 'Non-Profit', 'Admin'),
    allowNull: false,
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
  },
  otp: {
    type: DataTypes.STRING,
  },
  otpExpire: {
    type: DataTypes.DATE,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  KYCStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  KYCDocument: {
    type: DataTypes.STRING,
  },
  otpRequestCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  otpRequestTimestamp: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

// **Model Hook**: Hash the password before creating (and optionally before updating)
User.beforeCreate(async (user, options) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user, options) => {
  // Only hash if password is modified
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;
