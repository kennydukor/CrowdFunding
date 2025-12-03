'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('countries', {
   id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
   },
   country: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   currency: {
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
  await queryInterface.dropTable('countries');
 },
};
