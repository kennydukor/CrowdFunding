// models/index.js
const sequelize = require('../utils/db');
const User = require('./User'); // After migrating to Sequelize, rename these to PascalCase if you wish (e.g., User.js, Campaign.js)
const Campaign = require('./Campaign');
const Contribution = require('./Contribution');
const Country = require('./Countries');
const Category = require('./CampaignCategory');
const Beneficiary = require('./CampaignBeneficiary');
const Flag = require('./Flag');
const PrivateCampaign = require('./PrivateCampaign');
const PrivateCampaignShare = require('./PrivateCampaignShare'); // New model

// CAMPAIGN ---------------------
// 1) A User can have many Campaigns
User.hasMany(Campaign, { foreignKey: 'owner', onDelete: 'CASCADE' });
Campaign.belongsTo(User, { foreignKey: 'owner' });

// 1) Campaign belongs to Country (foreign key: countryId)
Country.hasMany(Campaign, { foreignKey: 'countryId' });
Campaign.belongsTo(Country, { foreignKey: 'countryId' });

// 2) Campaign belongs to Category (foreign key: categoryId)
Category.hasMany(Campaign, { foreignKey: 'categoryId' });
Campaign.belongsTo(Category, { foreignKey: 'categoryId' });

// 3) Campaign belongs to Beneficiary (foreign key: beneficiaryId)
Beneficiary.hasMany(Campaign, { foreignKey: 'beneficiaryId' });
Campaign.belongsTo(Beneficiary, { foreignKey: 'beneficiaryId' });

// ------------------------------

// 2) A Contribution belongs to both a Campaign and a User
User.hasMany(Contribution, { foreignKey: 'contributor', onDelete: 'CASCADE' });
Contribution.belongsTo(User, { foreignKey: 'contributor' });

Campaign.hasMany(Contribution, { foreignKey: 'campaign', onDelete: 'CASCADE' });
Contribution.belongsTo(Campaign, { foreignKey: 'campaign' });

// 3) A Flag belongs to both a Campaign and a User
User.hasMany(Flag, { foreignKey: 'flaggedBy', onDelete: 'CASCADE' });
Flag.belongsTo(User, { foreignKey: 'flaggedBy' });

Campaign.hasMany(Flag, { foreignKey: 'campaign', onDelete: 'CASCADE' });
Flag.belongsTo(Campaign, { foreignKey: 'campaign' });

// 4) PrivateCampaign belongs to a creator (User)
User.hasMany(PrivateCampaign, { foreignKey: 'creator', onDelete: 'CASCADE' });
PrivateCampaign.belongsTo(User, { foreignKey: 'creator' });

// 5) PrivateCampaignShare Relations
//    - A PrivateCampaign can have many shares.
PrivateCampaign.hasMany(PrivateCampaignShare, { foreignKey: 'privateCampaignId', onDelete: 'CASCADE' });
PrivateCampaignShare.belongsTo(PrivateCampaign, { foreignKey: 'privateCampaignId' });

//    - Each Share belongs to a single user.
User.hasMany(PrivateCampaignShare, { foreignKey: 'userId', onDelete: 'CASCADE' });
PrivateCampaignShare.belongsTo(User, { foreignKey: 'userId' });

// Export models & sequelize connection
module.exports = {
  sequelize,
  User,
  Campaign,
  Contribution,
  Flag,
  PrivateCampaign,
  PrivateCampaignShare, // Don't forget to export the new model
  Category,
  Beneficiary,
  Country
};
