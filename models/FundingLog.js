const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const FundingLog = sequelize.define(
 'FundingLog',
 {
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
   allowNull: true,
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

  /** ───────────────────────────────────
   *  AMOUNTS & CURRENCY
   * ─────────────────────────────────── */
  amountRequested: {
   // what donor intended to pay
   type: DataTypes.DECIMAL(10, 2),
   allowNull: false,
  },
  requestCurrency: {
   // currency shown on PSP checkout
   type: DataTypes.STRING, // ISO code → "USD"
   allowNull: false,
  },
  receivedAmount: {
   // settled amount (after fees) in requestCurrency
   type: DataTypes.DECIMAL(10, 2),
   allowNull: true,
  },
  baseAmount: {
   // converted to campaign.currency
   type: DataTypes.DECIMAL(10, 2),
   allowNull: true,
  },
  baseCurrency: {
   // campaign.currency snapshot (“NGN” / “USD” / …)
   type: DataTypes.STRING,
   allowNull: false,
  },
  fxRate: {
   // rate used for conversion
   type: DataTypes.DECIMAL(12, 6),
   allowNull: true,
  },
  amountMismatch: {
   // flag any discrepancy
   type: DataTypes.BOOLEAN,
   defaultValue: false,
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
  isAnonymous: {
   type: DataTypes.BOOLEAN,
   allowNull: true,
   defaultValue: false,
  },
  contributorEmail: {
   type: DataTypes.STRING,
   allowNull: true,
  },
 },
 {
  tableName: 'funding_logs',
  timestamps: true,
 },
);

module.exports = FundingLog;
