const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customers: [{
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        address: String,
        time: String
    }],
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed'],
        default: 'scheduled'
    }
});

module.exports = mongoose.model('Route', routeSchema);
