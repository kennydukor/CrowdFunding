// models/Flag.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');

const Flag = sequelize.define('Flag', {
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed'),
    defaultValue: 'pending',
  },
}, {
  tableName: 'flags',
  timestamps: true,
});

module.exports = Flag;
