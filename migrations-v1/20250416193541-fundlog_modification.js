'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /* ───── Rename existing columns ───── */
    await queryInterface.renameColumn('funding_logs', 'amount',   'amountRequested');
    await queryInterface.renameColumn('funding_logs', 'currency', 'requestCurrency');

    /* ───── Add new columns ───── */
    await queryInterface.addColumn('funding_logs', 'baseAmount', {
      type      : Sequelize.DECIMAL(10,2),
      allowNull : true,
    });

    await queryInterface.addColumn('funding_logs', 'baseCurrency', {
      type      : Sequelize.STRING,
      allowNull : false,
      defaultValue : 'NGN',           // can be changed later with UPDATE
    });

    await queryInterface.addColumn('funding_logs', 'fxRate', {
      type      : Sequelize.DECIMAL(12,6),
      allowNull : true,
    });

    /* ───── OPTIONAL – drop old helper column if no longer needed ─────
       (amountMismatch stays useful, so keep it)                         */
    // await queryInterface.removeColumn('funding_logs', 'currency');
  },

  down: async (queryInterface, Sequelize) => {
    /* reverse the above – only needed if you roll back */
    await queryInterface.removeColumn('funding_logs', 'fxRate');
    await queryInterface.removeColumn('funding_logs', 'baseCurrency');
    await queryInterface.removeColumn('funding_logs', 'baseAmount');
    await queryInterface.renameColumn('funding_logs', 'requestCurrency', 'currency');
    await queryInterface.renameColumn('funding_logs', 'amountRequested', 'amount');
  }
};
