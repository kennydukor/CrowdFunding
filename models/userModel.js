const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    firstName: { type: String },  // For individuals
    middleName: { type: String }, // For individuals
    lastName: { type: String },   // For individuals
    gender: { type: String },     // For individuals
    organizationName: { type: String }, // For non-profits
    userType: { 
        type: String, 
        required: true, 
        enum: ['Individual', 'Non-Profit', 'Admin'] // Enum for user types
    },
    interests: { type: [String] }, // Array of interests
    // role: { type: String, default: 'user' }, // 'user' or 'admin'
    role: { 
        type: String, 
        default: 'user', 
        enum: ['user', 'admin']  // Enum for roles
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    otp: { type: String },
    otpExpire: { type: Date },
    isVerified: { type: Boolean, default: false }, // New field for email verification
    KYCStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    KYCDocument: { type: String } // Optional: Link to their uploaded KYC document
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
