'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  /**
   * Add seed commands here.
   *
   * Example:
   * await queryInterface.bulkInsert('People', [{
   *   name: 'John Doe',
   *   isBetaMember: false
   * }], {});
   */
  await queryInterface.bulkInsert('payment_providers', [
   { name: 'Paystack', key: 'paystack', status: 'active', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Flutterwave', key: 'flutterwave', status: 'active', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Stripe', key: 'stripe', status: 'active', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Paypal', key: 'paypal', status: 'inactive', createdAt: new Date(), updatedAt: new Date() },
  ]);
 },

 async down(queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
   * await queryInterface.bulkDelete('People', null, {});
   */
  await queryInterface.bulkDelete('payment_providers', null, {});
 },
};
