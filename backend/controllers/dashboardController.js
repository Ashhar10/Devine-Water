const { prisma } = require('../config/db');

// Admin dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Orders statistics
        const [totalOrders, pendingOrders, todayOrders] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'pending' } }),
            prisma.order.count({ where: { orderDate: { gte: today, lt: tomorrow } } })
        ]);

        // Finance statistics
        const [totalIncomeResult, totalExpensesResult] = await Promise.all([
            prisma.financeIncoming.aggregate({ _sum: { amount: true } }),
            prisma.financeOutgoing.aggregate({ _sum: { amount: true } })
        ]);

        const totalIncome = Number(totalIncomeResult._sum.amount || 0);
        const totalExpenses = Number(totalExpensesResult._sum.amount || 0);

        // User statistics
        const [totalCustomers, totalSuppliers] = await Promise.all([
            prisma.user.count({ where: { role: 'customer' } }),
            prisma.user.count({ where: { role: 'supplier' } })
        ]);

        // Pending deliveries
        const pendingDeliveries = await prisma.delivery.count({ where: { status: 'pending' } });

        res.json({
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                today: todayOrders
            },
            finance: {
                totalIncome,
                totalExpenses,
                netProfit: totalIncome - totalExpenses
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
        const [orders, payments] = await Promise.all([
            prisma.order.findMany({
                where: { customerId: req.userId },
                orderBy: { orderDate: 'desc' },
                take: 10
            }),
            prisma.financeIncoming.findMany({
                where: { customerId: req.userId },
                orderBy: { date: 'desc' },
                take: 5
            })
        ]);

        const totalSpent = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

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
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayDeliveries, pendingDeliveries] = await Promise.all([
            prisma.delivery.findMany({
                where: {
                    supplierId: req.userId,
                    deliveryDate: { gte: today, lt: tomorrow }
                },
                include: {
                    order: {
                        include: {
                            customer: { select: { id: true, fullName: true, phone: true, address: true } }
                        }
                    }
                }
            }),
            prisma.delivery.findMany({
                where: {
                    supplierId: req.userId,
                    status: 'pending'
                },
                include: { order: true }
            })
        ]);

        res.json({
            todayDeliveries,
            pendingDeliveries
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
