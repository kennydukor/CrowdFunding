const flagSchema = new mongoose.Schema({
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' }
}, { timestamps: true });

const Flag = mongoose.model('Flag', flagSchema);
