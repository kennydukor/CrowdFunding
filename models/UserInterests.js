const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const UserInterests = sequelize.define('UserInterests', {
  userId: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  interestId: {
    type: DataTypes.INTEGER,
    references: { model: 'interests', key: 'id' },
    onDelete: 'CASCADE',
  }
}, {
  tableName: 'user_interests',
  timestamps: false,
});

module.exports = UserInterests;
