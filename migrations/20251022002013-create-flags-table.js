'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('flags', {
   id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
   },
   reason: {
    type: Sequelize.TEXT,
    allowNull: false,
   },
   status: {
    type: Sequelize.ENUM('pending', 'reviewed'),
    allowNull: false,
    defaultValue: 'pending',
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
  await queryInterface.dropTable('flags');
 },
};
