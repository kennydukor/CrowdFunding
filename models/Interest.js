const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Interest = sequelize.define('Interest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'interests',
  timestamps: false,
});

module.exports = Interest;
