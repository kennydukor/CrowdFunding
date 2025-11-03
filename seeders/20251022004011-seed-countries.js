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
  await queryInterface.bulkInsert('countries', [
   { country: 'Nigeria', currency: 'NGN', createdAt: new Date(), updatedAt: new Date() },
   { country: 'Ghana', currency: 'GHS', createdAt: new Date(), updatedAt: new Date() },
   { country: 'Kenya', currency: 'KES', createdAt: new Date(), updatedAt: new Date() },
   { country: 'United States', currency: 'USD', createdAt: new Date(), updatedAt: new Date() },
   { country: 'United Kingdom', currency: 'GBP', createdAt: new Date(), updatedAt: new Date() },
  ]);
 },

 async down(queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
   * await queryInterface.bulkDelete('People', null, {});
   */
  await queryInterface.bulkDelete('categories', null, {});
 },
};
