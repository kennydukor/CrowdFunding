'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.ENUM("blocked","active","inactive"),
      defaultValue: "active",
    });
    await queryInterface.addColumn("users", "numberOfFailedLoginAuthAttempt",{
      type:Sequelize.INTEGER,
      defaultValue:0
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.removeColumn('users', 'numberOfFailedLoginAuthAttempt');
  }
};
