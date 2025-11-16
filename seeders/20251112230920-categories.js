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

  await queryInterface.bulkInsert('categories', [
   { name: 'Health', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Education', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Community', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Business', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Emergency', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Environment', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Technology', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Sports', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Arts & Culture', createdAt: new Date(), updatedAt: new Date() },
   { name: 'Religion', createdAt: new Date(), updatedAt: new Date() },
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
