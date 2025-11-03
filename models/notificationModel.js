// models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Notification = sequelize.define(
 'Notification',
 {
  id: {
   type: DataTypes.INTEGER,
   autoIncrement: true,
   primaryKey: true,
  },
  userId: {
   type: DataTypes.INTEGER,
   allowNull: false,
   references: {
    model: 'users', // assumes a `users` table already exists
    key: 'id',
   },
   onDelete: 'CASCADE',
  },
  message: {
   type: DataTypes.STRING,
   allowNull: false,
  },
  type: {
   type: DataTypes.STRING,
   allowNull: false,
  },
 },
 {
  tableName: 'notifications',
  timestamps: true,
 },
);

module.exports = Notification;
