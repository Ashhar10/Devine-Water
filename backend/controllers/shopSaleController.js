const { prisma } = require('../config/db');

// Get sales
exports.getSales = async (req, res) => {
    try {
        const where = {};

        if (req.user.role === 'shopkeeper') {
            where.shopkeeperId = req.userId;
        }

        const sales = await prisma.shopSale.findMany({
            where,
            include: {
                shopkeeper: { select: { id: true, fullName: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Record sale (Shopkeeper)
exports.recordSale = async (req, res) => {
    try {
        const { quantity, cashReceived, totalAmount } = req.body;

        const sale = await prisma.shopSale.create({
            data: {
                shopkeeperId: req.userId,
                quantity,
                cashReceived,
                changeReturned: cashReceived - totalAmount,
                totalAmount
            },
            include: {
                shopkeeper: { select: { id: true, fullName: true } }
            }
        });

        // Also add to finance incoming
        await prisma.financeIncoming.create({
            data: {
                source: 'shop_sale',
                amount: totalAmount,
                shopkeeperId: req.userId,
                description: `Shop sale - ${quantity} units`
            }
        });

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get daily sales report
exports.getDailySales = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const where = {
            date: { gte: today, lt: tomorrow }
        };

        if (req.user.role === 'shopkeeper') {
            where.shopkeeperId = req.userId;
        }

        const sales = await prisma.shopSale.findMany({
            where,
            include: {
                shopkeeper: { select: { id: true, fullName: true } }
            }
        });

        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

        res.json({
            sales,
            summary: {
                totalSales,
                totalQuantity,
                numberOfTransactions: sales.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
