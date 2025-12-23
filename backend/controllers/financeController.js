const FinanceIncoming = require('../models/FinanceIncoming');
const FinanceOutgoing = require('../models/FinanceOutgoing');

// Get incoming transactions
exports.getIncoming = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const incoming = await FinanceIncoming.find(query)
            .populate('customerId', 'fullName')
            .populate('shopkeeperId', 'fullName')
            .sort({ date: -1 });

        res.json(incoming);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add incoming transaction
exports.addIncoming = async (req, res) => {
    try {
        const transaction = await FinanceIncoming.create(req.body);
        const populated = await FinanceIncoming.findById(transaction._id)
            .populate('customerId shopkeeperId');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get outgoing transactions
exports.getOutgoing = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (category) {
            query.category = category;
        }

        const outgoing = await FinanceOutgoing.find(query).sort({ date: -1 });

        res.json(outgoing);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add expense
exports.addExpense = async (req, res) => {
    try {
        const expense = await FinanceOutgoing.create(req.body);
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
            dateFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Total incoming
        const incomingAgg = await FinanceIncoming.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$source', total: { $sum: '$amount' } } }
        ]);

        // Total outgoing by category
        const outgoingAgg = await FinanceOutgoing.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const totalIncoming = incomingAgg.reduce((sum, item) => sum + item.total, 0);
        const totalOutgoing = outgoingAgg.reduce((sum, item) => sum + item.total, 0);

        res.json({
            incoming: {
                breakdown: incomingAgg,
                total: totalIncoming
            },
            outgoing: {
                breakdown: outgoingAgg,
                total: totalOutgoing
            },
            netProfit: totalIncoming - totalOutgoing
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
