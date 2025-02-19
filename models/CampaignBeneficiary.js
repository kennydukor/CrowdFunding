// models/Beneficiary.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Beneficiary = sequelize.define('Beneficiary', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'beneficiaries',
  timestamps: false,
});

module.exports = Beneficiary;
