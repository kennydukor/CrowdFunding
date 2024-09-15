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
    story: { type: String },
    coverPhoto: { type: String },
    videoUrl: { type: String },
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
