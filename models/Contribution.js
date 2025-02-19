// models/Contribution.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');

const Contribution = sequelize.define('Contribution', {
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'contributions',
  timestamps: true,
});

module.exports = Contribution;
