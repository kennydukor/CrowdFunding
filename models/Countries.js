// models/Country.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db'); // Adjust path to your sequelize instance

const Country = sequelize.define('Country', {
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'countries',
  timestamps: false,  // You can enable timestamps if you want
});

module.exports = Country;
