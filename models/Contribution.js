// models/Contribution.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db.js');
const Campaigns = require('./Campaign.js');

const Contribution = sequelize.define(
 'Contribution',
 {
  amount: {
   type: DataTypes.DECIMAL,
   allowNull: false,
  },
  anonymous: {
   type: DataTypes.BOOLEAN,
   defaultValue: false,
  },

  campaign: {
   type: DataTypes.INTEGER,
   allowNull: false,
   references: { model: 'campaigns', key: 'id' },
   onDelete: 'CASCADE',
  },
 },
 {
  tableName: 'contributions',
  timestamps: true,
 },
);

// Contribution.belongsTo(Campaigns, { foreignKey: 'campaign' });
// Campaigns.hasMany(Contribution, { foreignKey: 'campaign' });

module.exports = Contribution;
