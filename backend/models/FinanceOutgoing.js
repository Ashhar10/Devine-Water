const mongoose = require('mongoose');

const financeOutgoingSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['electricity', 'chemicals', 'maintenance', 'water', 'fuel', 'other'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    receipt: String
});

module.exports = mongoose.model('FinanceOutgoing', financeOutgoingSchema);
