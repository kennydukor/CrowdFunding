// models/PaymentProvider.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PaymentProvider = sequelize.define('PaymentProvider', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures no duplicate providers
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
}, {
    tableName: 'payment_providers',
    timestamps: true,
});

module.exports = PaymentProvider;
