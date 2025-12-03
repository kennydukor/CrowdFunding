'use strict';

module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable('campaigns', {
   id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
   },
   title: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   description: {
    type: Sequelize.TEXT,
    allowNull: false,
   },
   location: {
    type: Sequelize.STRING,
    allowNull: true,
   },
   goalAmount: {
    type: Sequelize.DECIMAL,
    allowNull: true,
   },
   raisedAmount: {
    type: Sequelize.DECIMAL,
    defaultValue: 0,
   },
   deadline: {
    type: Sequelize.DATE,
    allowNull: true,
   },
   media: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    defaultValue: [],
   },
   currency: {
    type: Sequelize.TEXT,
    allowNull: true,
   },
   story: {
    type: Sequelize.TEXT,
   },
   coverPhoto: {
    type: Sequelize.STRING,
   },
   videoUrl: {
    type: Sequelize.STRING,
   },
   status: {
    type: Sequelize.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
   },
   countryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
   },
   categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'categories', key: 'id' },
    onDelete: 'CASCADE',
   },
   beneficiaryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'beneficiaries', key: 'id' },
    onDelete: 'CASCADE',
   },
   slug: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
   },
   isComplete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
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
  await queryInterface.dropTable('campaigns');
 },
};
