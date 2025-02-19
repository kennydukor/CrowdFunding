// models/PrivateCampaign.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');

const PrivateCampaign = sequelize.define('PrivateCampaign', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  tableName: 'private_campaigns',
  timestamps: true,
});

module.exports = PrivateCampaign;
