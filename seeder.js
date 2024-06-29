const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel'); // Adjust the path as necessary

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const createAdminUser = async () => {
    try {
        // Check if an admin user already exists
        let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (adminUser) {
            console.log('Admin user already exists');
            return;
        }

        // Create a new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

        adminUser = new User({
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isVerified: true
        });

        await adminUser.save();
        console.log('Admin user created successfully');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    await createAdminUser();
    // Add more seeding functions here if needed

    console.log('Database seeding completed');
    process.exit();
};

seedDatabase();
