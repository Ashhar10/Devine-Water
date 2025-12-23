const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'delivered', 'cancelled'],
        default: 'pending'
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true
    },
    notes: String
});

module.exports = mongoose.model('Order', orderSchema);
