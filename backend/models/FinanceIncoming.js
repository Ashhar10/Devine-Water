const mongoose = require('mongoose');

const financeIncomingSchema = new mongoose.Schema({
    source: {
        type: String,
        enum: ['customer_payment', 'shop_sale', 'monthly_billing'],
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
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: String,
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'other'],
        default: 'cash'
    }
});

module.exports = mongoose.model('FinanceIncoming', financeIncomingSchema);
