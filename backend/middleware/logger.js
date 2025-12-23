const { prisma } = require('../config/db');

// Middleware to log activities
const logActivity = (action, entity) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.send;

        res.send = function (data) {
            // Only log successful operations (200-299 status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                prisma.activityLog.create({
                    data: {
                        userId: req.userId,
                        action,
                        entity,
                        entityId: req.params.id || null,
                        details: JSON.stringify(req.body),
                        ipAddress: req.ip
                    }
                }).catch(err => console.error('Activity log error:', err));
            }

            // Call original send function
            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = { logActivity };
