const { prisma } = require('../config/db');

// Get activity logs (Admin only)
exports.getLogs = async (req, res) => {
    try {
        const { limit = 100, skip = 0 } = req.query;

        const logs = await prisma.activityLog.findMany({
            include: {
                user: {
                    select: { id: true, fullName: true, username: true, role: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit),
            skip: parseInt(skip)
        });

        const total = await prisma.activityLog.count();

        res.json({ logs, total });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const logs = await prisma.activityLog.findMany({
            where: { userId: id },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
