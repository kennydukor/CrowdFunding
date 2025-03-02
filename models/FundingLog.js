const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const FundingLog = sequelize.define('FundingLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Generates unique ID
        primaryKey: true,
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'campaigns', key: 'id' },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    paymentProviderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'payment_providers', key: 'id' },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    systemTransactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures each transaction is unique
    },
    providerTransactionId: {
        type: DataTypes.STRING,
        allowNull: true, // Initially null until payment is completed
        unique: true, // Ensures uniqueness
    },
    status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
}, {
    tableName: 'funding_logs',
    timestamps: true,
});

module.exports = FundingLog;
