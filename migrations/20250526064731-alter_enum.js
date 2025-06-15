'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Replace old enum for userType
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_userType" RENAME TO "enum_users_userType_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_userType" AS ENUM ('Individual', 'Organization', 'Admin');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "userType" TYPE "enum_users_userType"
      USING "userType"::text::"enum_users_userType";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_users_userType_old";
    `);

    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_users_gender";`);
    
    // 2. Add gender ENUM (if it's currently a STRING)
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_gender" AS ENUM ('male', 'female');
    `);

    // Fix invalid entries BEFORE changing column type
    await queryInterface.sequelize.query(`
      UPDATE "users"
      SET "gender" = NULL
      WHERE "gender" NOT IN ('male', 'female');
    `);

    await queryInterface.changeColumn('users', 'gender', {
      type: Sequelize.ENUM('male', 'female'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert gender ENUM to STRING (if needed)
    await queryInterface.changeColumn('users', 'gender', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_gender";
    `);

    // Revert userType ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_userType_old" AS ENUM ('Individual', 'Non-Profit', 'Admin');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ALTER COLUMN "userType" TYPE "enum_users_userType_old"
      USING "userType"::text::"enum_users_userType_old";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_users_userType";
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_userType_old" RENAME TO "enum_users_userType";
    `);
  }
};
