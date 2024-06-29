const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    anonymous: { type: Boolean, default: false },
}, { timestamps: true });

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution;
