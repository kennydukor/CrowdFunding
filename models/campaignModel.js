const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    // category: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['Health', 'Education', 'Environment', 'Emergency', 'Community'] // Add relevant categories
    },
    media: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    // beneficiary: { type: String, required: true }, // 'Yourself', 'Someone else', 'Charity'
    beneficiary: { 
        type: String, 
        required: true, 
        enum: ['Yourself', 'Someone else', 'Charity']  // Beneficiary enum
    },
    currency: {
        type: String,
        required: true,
        enum: [
            'GHS',  // Ghana Cedi
            'NGN',  // Nigerian Naira
            'GBP',  // British Pound
            'CAD',  // Canadian Dollar
            'USD',  // US Dollar
            'EUR',  // Euro (for Germany)
            'KES',  // Kenyan Shilling
            'ZAR',  // South African Rand
            'RWF',  // Rwandan Franc
            'ETB',  // Ethiopian Birr
            'EGP',  // Egyptian Pound
            'SLL',  // Sierra Leonean Leone
            'LRD',  // Liberian Dollar
            // Add more serious African currencies as needed
        ]
    },
    story: { type: String },
    coverPhoto: { type: String },
    videoUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
