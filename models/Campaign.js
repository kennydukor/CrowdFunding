// models/Campaign.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Campaign = sequelize.define('Campaign', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  goalAmount: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  raisedAmount: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  media: {
    type: DataTypes.ARRAY(DataTypes.STRING), 
    defaultValue: [],
  },
  currency: {
    type: DataTypes.TEXT, // Accomodating for cases where customers might need to use currencies different from that of the location
    allowNull: true,
  },
  story: {
    type: DataTypes.TEXT,
  },
  coverPhoto: {
    type: DataTypes.STRING,
  },
  videoUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  // If you need an "isComplete" field:
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
});

module.exports = Campaign;
