'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1️⃣ Create payment_providers table
    await queryInterface.createTable('payment_providers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // 2️⃣ Seed default payment providers
    await queryInterface.bulkInsert('payment_providers', [
      { name: 'Paystack', key: 'paystack', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Flutterwave', key: 'flutterwave', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Stripe', key: 'stripe', status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paypal', key: 'paypal', status: 'inactive', createdAt: new Date(), updatedAt: new Date() }
    ]);

    // 3️⃣ Create funding_logs table (depends on payment_providers)
    await queryInterface.createTable('funding_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      campaignId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      paymentProviderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payment_providers',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      receivedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      amountMismatch: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'NGN',
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      systemTransactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      providerTransactionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'successful', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('funding_logs');
    await queryInterface.bulkDelete('payment_providers', null, {});
    await queryInterface.dropTable('payment_providers');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_payment_providers_status";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_funding_logs_status";`);
  }
};
