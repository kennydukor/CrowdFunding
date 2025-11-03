'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('notifications', {
   id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
   },
   userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
     model: 'users', // references your users table
     key: 'id',
    },
    onDelete: 'CASCADE',
   },
   message: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   type: {
    type: Sequelize.STRING,
    allowNull: false,
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
  await queryInterface.dropTable('notifications');
 },
};
