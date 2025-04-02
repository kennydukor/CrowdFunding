const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const FundingLog = sequelize.define('FundingLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'campaigns',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  paymentProviderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'payment_providers',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  receivedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  amountMismatch: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NGN', // Optional: set a default
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  systemTransactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  providerTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true, // Optional details (provider response, etc.)
  },
}, {
  tableName: 'funding_logs',
  timestamps: true,
});

module.exports = FundingLog;

  