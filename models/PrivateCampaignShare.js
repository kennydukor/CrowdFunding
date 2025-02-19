// models/PrivateCampaignShare.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');

const PrivateCampaignShare = sequelize.define('PrivateCampaignShare', {
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'private_campaign_shares',
  timestamps: true,
});

module.exports = PrivateCampaignShare;
