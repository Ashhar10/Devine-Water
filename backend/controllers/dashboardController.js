const Order = require('../models/Order');
const FinanceIncoming = require('../models/FinanceIncoming');
const FinanceOutgoing = require('../models/FinanceOutgoing');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// Admin dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Orders statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const todayOrders = await Order.countDocuments({ orderDate: { $gte: today } });

        // Finance statistics
        const totalIncome = await FinanceIncoming.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = await FinanceOutgoing.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // User statistics
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalSuppliers = await User.countDocuments({ role: 'supplier' });

        // Pending deliveries
        const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });

        res.json({
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                today: todayOrders
            },
            finance: {
                totalIncome: totalIncome[0]?.total || 0,
                totalExpenses: totalExpenses[0]?.total || 0,
                netProfit: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0)
            },
            users: {
                customers: totalCustomers,
                suppliers: totalSuppliers
            },
            deliveries: {
                pending: pendingDeliveries
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Customer dashboard
exports.getCustomerDashboard = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.userId })
            .sort({ orderDate: -1 })
            .limit(10);

        const payments = await FinanceIncoming.find({ customerId: req.userId })
            .sort({ date: -1 })
            .limit(5);

        const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

        res.json({
            recentOrders: orders,
            recentPayments: payments,
            totalSpent
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Supplier dashboard
exports.getSupplierDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayDeliveries = await Delivery.find({
            supplierId: req.userId,
            deliveryDate: { $gte: today }
        }).populate({
            path: 'orderId',
            populate: { path: 'customerId', select: 'fullName phone address' }
        });

        const pendingDeliveries = await Delivery.find({
            supplierId: req.userId,
            status: 'pending'
        }).populate('orderId');

        res.json({
            todayDeliveries,
            pendingDeliveries
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
