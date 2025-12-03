// const mongoose = require('mongoose');
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { sequelize, User, Category, Beneficiary, Country } = require("./models");
const CampaignEnums = require("./utils/campaignEnums");
// const User = require('./models/userModel'); // Adjust the path as necessary

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Check if an admin user already exists
    let adminUser = await User.findOne({
      where: { email: process.env.ADMIN_EMAIL },
    });
    if (adminUser) {
      console.log("Admin user already exists");
      return;
    }

    // // Create a new admin user
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    adminUser = await User.create({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      userType: "Admin",
      isVerified: true,
      KYCStatus: "approved",
    });

    console.log("Admin user created successfully");
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
};

const seedCampaignEnums = async () => {
  try {
    // Seed Categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      const categoriesData = CampaignEnums.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));
      await Category.bulkCreate(categoriesData);
      console.log("Categories seeded.");
    } else {
      console.log("Categories already seeded. Skipping.");
    }

    // Seed Beneficiaries
    const beneficiaryCount = await Beneficiary.count();
    if (beneficiaryCount === 0) {
      const beneficiariesData = CampaignEnums.beneficiaries.map((ben) => ({
        id: ben.id,
        name: ben.name,
      }));
      await Beneficiary.bulkCreate(beneficiariesData);
      console.log("Beneficiaries seeded.");
    } else {
      console.log("Beneficiaries already seeded. Skipping.");
    }

    // Seed African Countries
    const countryCount = await Country.count();
    if (countryCount === 0) {
      const countriesData = CampaignEnums.africanCurrencies.map((country) => ({
        id: country.id,
        country: country.country,
        currency: country.currency,
      }));
      await Country.bulkCreate(countriesData);
      console.log("African countries seeded.");
    } else {
      console.log("African countries already seeded. Skipping.");
    }

    console.log("Campaign enums seeding completed.");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    await sequelize.sync({ force: false });

    await createAdminUser();
    // await seedCampaignEnums();

    console.log("Database seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Database seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
