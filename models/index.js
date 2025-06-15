const sequelize = require('../utils/db');
const User = require('./User');
const Campaign = require('./Campaign');
const Contribution = require('./Contribution');
const Country = require('./Countries');
const Category = require('./CampaignCategory');
const Beneficiary = require('./CampaignBeneficiary');
const Flag = require('./Flag');
const PrivateCampaign = require('./PrivateCampaign');
const PrivateCampaignShare = require('./PrivateCampaignShare');
const PaymentProvider = require('./PaymentProvider');
const FundingLog = require('./FundingLog');
const Interest = require('./Interest')

// ========== RELATIONSHIPS ==========

// User → Campaign
User.hasMany(Campaign, { foreignKey: 'owner', onDelete: 'CASCADE' });
Campaign.belongsTo(User, { foreignKey: 'owner' });

// Campaign → Country
Country.hasMany(Campaign, { foreignKey: 'countryId' });
Campaign.belongsTo(Country, { foreignKey: 'countryId' });

// Campaign → Category
Category.hasMany(Campaign, { foreignKey: 'categoryId' });
Campaign.belongsTo(Category, { foreignKey: 'categoryId' });

// Campaign → Beneficiary
Beneficiary.hasMany(Campaign, { foreignKey: 'beneficiaryId' });
Campaign.belongsTo(Beneficiary, { foreignKey: 'beneficiaryId' });

// User → Contribution
User.hasMany(Contribution, { foreignKey: 'contributor', onDelete: 'CASCADE' });
Contribution.belongsTo(User, { foreignKey: 'contributor' });

// Campaign → Contribution
Campaign.hasMany(Contribution, { foreignKey: 'campaign', onDelete: 'CASCADE' });
Contribution.belongsTo(Campaign, { foreignKey: 'campaign' });

// User → Flag
User.hasMany(Flag, { foreignKey: 'flaggedBy', onDelete: 'CASCADE' });
Flag.belongsTo(User, { foreignKey: 'flaggedBy' });

// Campaign → Flag
Campaign.hasMany(Flag, { foreignKey: 'campaign', onDelete: 'CASCADE' });
Flag.belongsTo(Campaign, { foreignKey: 'campaign' });

// User → PrivateCampaign
User.hasMany(PrivateCampaign, { foreignKey: 'creator', onDelete: 'CASCADE' });
PrivateCampaign.belongsTo(User, { foreignKey: 'creator' });

// PrivateCampaign → PrivateCampaignShare
PrivateCampaign.hasMany(PrivateCampaignShare, { foreignKey: 'privateCampaignId', onDelete: 'CASCADE' });
PrivateCampaignShare.belongsTo(PrivateCampaign, { foreignKey: 'privateCampaignId' });

// User → PrivateCampaignShare
User.hasMany(PrivateCampaignShare, { foreignKey: 'userId', onDelete: 'CASCADE' });
PrivateCampaignShare.belongsTo(User, { foreignKey: 'userId' });

// ========== 💳 Payment Logic ==========
// User → FundingLog
User.hasMany(FundingLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
FundingLog.belongsTo(User, { foreignKey: 'userId' });

// Campaign → FundingLog
Campaign.hasMany(FundingLog, { foreignKey: 'campaignId', onDelete: 'CASCADE' });
FundingLog.belongsTo(Campaign, { foreignKey: 'campaignId' });

// PaymentProvider → FundingLog
PaymentProvider.hasMany(FundingLog, { foreignKey: 'paymentProviderId' });
FundingLog.belongsTo(PaymentProvider, { foreignKey: 'paymentProviderId' });

User.belongsToMany(Interest, { through: 'user_interests', foreignKey: 'userId' });
Interest.belongsToMany(User, { through: 'user_interests', foreignKey: 'interestId' });


// ========== EXPORT ALL MODELS ==========
module.exports = {
  sequelize,
  User,
  Campaign,
  Contribution,
  Flag,
  PrivateCampaign,
  PrivateCampaignShare,
  Category,
  Beneficiary,
  Country,
  PaymentProvider,
  FundingLog,
  Interest
};
