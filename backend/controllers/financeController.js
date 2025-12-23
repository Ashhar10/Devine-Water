const { prisma } = require('../config/db');

// Get incoming transactions
exports.getIncoming = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const incoming = await prisma.financeIncoming.findMany({
            where,
            include: {
                customer: { select: { id: true, fullName: true } },
                shopkeeper: { select: { id: true, fullName: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.json(incoming);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add incoming transaction
exports.addIncoming = async (req, res) => {
    try {
        const transaction = await prisma.financeIncoming.create({
            data: req.body,
            include: {
                customer: true,
                shopkeeper: true
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get outgoing transactions
exports.getOutgoing = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (category) {
            where.category = category;
        }

        const outgoing = await prisma.financeOutgoing.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        res.json(outgoing);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add expense
exports.addExpense = async (req, res) => {
    try {
        const expense = await prisma.financeOutgoing.create({
            data: req.body
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get financial reports
exports.getReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Aggregate incoming by source
        const incomingAgg = await prisma.financeIncoming.groupBy({
            by: ['source'],
            where: dateFilter,
            _sum: { amount: true }
        });

        // Aggregate outgoing by category
        const outgoingAgg = await prisma.financeOutgoing.groupBy({
            by: ['category'],
            where: dateFilter,
            _sum: { amount: true }
        });

        const totalIncoming = incomingAgg.reduce((sum, item) => sum + Number(item._sum.amount || 0), 0);
        const totalOutgoing = outgoingAgg.reduce((sum, item) => sum + Number(item._sum.amount || 0), 0);

        // Format response
        const incomingBreakdown = incomingAgg.map(item => ({
            _id: item.source,
            total: Number(item._sum.amount || 0)
        }));

        const outgoingBreakdown = outgoingAgg.map(item => ({
            _id: item.category,
            total: Number(item._sum.amount || 0)
        }));

        res.json({
            incoming: {
                breakdown: incomingBreakdown,
                total: totalIncoming
            },
            outgoing: {
                breakdown: outgoingBreakdown,
                total: totalOutgoing
            },
            netProfit: totalIncoming - totalOutgoing
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
