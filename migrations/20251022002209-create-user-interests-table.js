'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('user_interests', {
   userId: {
    type: Sequelize.INTEGER,
    references: {
     model: 'users',
     key: 'id',
    },
    onDelete: 'CASCADE',
    allowNull: false,
   },
   interestId: {
    type: Sequelize.INTEGER,
    references: {
     model: 'interests',
     key: 'id',
    },
    onDelete: 'CASCADE',
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
  await queryInterface.dropTable('user_interests');
 },
};
