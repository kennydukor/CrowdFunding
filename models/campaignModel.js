const mongoose = require('mongoose');
const CampaignEnums = require('../utils/campaignEnums');

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: false },
    raisedAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: false },
    category: { 
        type: String, 
        required: true, 
        enum: CampaignEnums.categories
    },
    media: { type: [String], default: [] },  // Use this field for all extra images
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    beneficiary: { 
        type: String, 
        required: true, 
        enum: CampaignEnums.beneficiaries
    },
    currency: {
        type: String,
        required: false,
        enum: CampaignEnums.currencies
    },
    story: { type: String },
    coverPhoto: { type: String },
    videoUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
