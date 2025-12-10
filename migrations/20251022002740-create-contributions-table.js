'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('contributions', {
   id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
   },
   amount: {
    type: Sequelize.DECIMAL,
    allowNull: false,
   },
   anonymous: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
   },
   contributorEmail: {
    type: Sequelize.STRING,
    allowNull: true,
   },
   campaign: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
     model: 'campaigns',
     key: 'id',
    },
    onDelete: 'SET NULL',
   },
   contributorId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
     model: 'users',
     key: 'id',
    },
    onDelete: 'SET NULL',
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
  await queryInterface.dropTable('contributions');
 },
};
