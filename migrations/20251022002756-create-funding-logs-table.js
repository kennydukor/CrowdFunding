'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  //enable uuid extension
  await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  await queryInterface.createTable('funding_logs', {
   id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal('uuid_generate_v4()'),
    primaryKey: true,
    allowNull: false,
   },
   campaignId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'campaigns', key: 'id' },
    onDelete: 'CASCADE',
   },
   userId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
   },
   paymentProviderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'payment_providers', key: 'id' },
    onDelete: 'CASCADE',
   },
   amountRequested: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
   },
   requestCurrency: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   receivedAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
   },
   baseAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
   },
   baseCurrency: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   fxRate: {
    type: Sequelize.DECIMAL(12, 6),
    allowNull: true,
   },
   amountMismatch: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
   },
   paymentMethod: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   systemTransactionId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
   },
   providerTransactionId: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true,
   },
   status: {
    type: Sequelize.ENUM('pending', 'successful', 'failed', 'refunded'),
    defaultValue: 'pending',
   },
   isAnonymous: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
   },
   contributorEmail: {
    type: Sequelize.STRING,
    allowNull: true,
   },
   metadata: {
    type: Sequelize.JSONB,
    allowNull: true,
   },
   createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
   },
   updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
   },
  });
 },

 async down(queryInterface, Sequelize) {
  await queryInterface.dropTable('funding_logs');
 },
};
