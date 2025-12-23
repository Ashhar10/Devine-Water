const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete', 'login', 'logout'],
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: mongoose.Schema.Types.ObjectId,
    details: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: String
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
