module.exports = {
 up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('users', {
   id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
   },
   email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
   },
   password: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   profilePicture: {
    type: Sequelize.STRING,
    defaultValue: '',
   },
   bio: {
    type: Sequelize.TEXT,
    defaultValue: '',
   },
   firstName: {
    type: Sequelize.STRING,
   },
   middleName: {
    type: Sequelize.STRING,
   },
   lastName: {
    type: Sequelize.STRING,
   },
   gender: {
    type: Sequelize.ENUM('male', 'female', 'others'),
    allowNull: true,
   },
   organizationName: {
    type: Sequelize.STRING,
   },
   userType: {
    type: Sequelize.ENUM('Individual', 'Organization', 'Admin'),
    allowNull: false,
   },
   role: {
    type: Sequelize.ENUM('user', 'admin'),
    defaultValue: 'user',
   },
   resetPasswordToken: {
    type: Sequelize.STRING,
   },
   resetPasswordExpire: {
    type: Sequelize.DATE,
   },
   otp: {
    type: Sequelize.STRING,
   },
   otpExpire: {
    type: Sequelize.DATE,
   },
   isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
   },
   KYCStatus: {
    type: Sequelize.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
   },
   KYCDocument: {
    type: Sequelize.STRING,
   },
   status: {
    type: Sequelize.ENUM('blocked', 'active', 'inactive'),
    defaultValue: 'active',
   },
   numberOfFailedLoginAuthAttempt: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
   },
   otpRequestCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
   },
   otpRequestTimestamp: {
    type: Sequelize.DATE,
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

 down: async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('users');
 },
};
