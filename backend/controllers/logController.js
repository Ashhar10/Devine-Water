const ActivityLog = require('../models/ActivityLog');

// Get activity logs (Admin only)
exports.getLogs = async (req, res) => {
    try {
        const { limit = 100, skip = 0 } = req.query;

        const logs = await ActivityLog.find()
            .populate('userId', 'fullName username role')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await ActivityLog.countDocuments();

        res.json({ logs, total });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const logs = await ActivityLog.find({ userId: id })
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
