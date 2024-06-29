const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    shares: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            paid: { type: Boolean, default: false },
        }
    ],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
