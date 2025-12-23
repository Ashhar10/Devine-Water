const mongoose = require('mongoose');

const shopSaleSchema = new mongoose.Schema({
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    cashReceived: {
        type: Number,
        required: true,
        min: 0
    },
    changeReturned: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ShopSale', shopSaleSchema);
