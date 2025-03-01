'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Add location column to campaigns table after location column
    await queryInterface.addColumn('campaigns', 'location', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null because location is optional
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Remove location column from campaigns table
    await queryInterface.removeColumn('campaigns', 'location');
  }
};

/** Change currency column type to STRING */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('campaigns', 'currency', {
      type: Sequelize.STRING,  // Change to STRING (TEXT)
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('campaigns', 'currency', {
      type: Sequelize.INTEGER, // Revert back to INTEGER if needed
      allowNull: true
    });
  }
};
