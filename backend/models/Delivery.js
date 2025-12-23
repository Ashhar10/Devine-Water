const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    route: String,
    completedAt: Date
});

module.exports = mongoose.model('Delivery', deliverySchema);
