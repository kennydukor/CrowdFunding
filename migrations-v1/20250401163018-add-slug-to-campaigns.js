'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('campaigns', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('campaigns', 'slug');
  }
};
