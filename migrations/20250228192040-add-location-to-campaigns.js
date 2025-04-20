'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add location column
    await queryInterface.addColumn('campaigns', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Change currency column from INTEGER to STRING
    await queryInterface.changeColumn('campaigns', 'currency', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove location column
    await queryInterface.removeColumn('campaigns', 'location');

    // Revert currency column back to INTEGER
    await queryInterface.changeColumn('campaigns', 'currency', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};



// /** Change currency column type to STRING */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.changeColumn('campaigns', 'currency', {
//       type: Sequelize.STRING,  // Change to STRING (TEXT)
//       allowNull: true
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.changeColumn('campaigns', 'currency', {
//       type: Sequelize.INTEGER, // Revert back to INTEGER if needed
//       allowNull: true
//     });
//   }
// };
