const ShopSale = require('../models/ShopSale');
const FinanceIncoming = require('../models/FinanceIncoming');

// Get sales
exports.getSales = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'shopkeeper') {
            query.shopkeeperId = req.userId;
        }

        const sales = await ShopSale.find(query)
            .populate('shopkeeperId', 'fullName')
            .sort({ date: -1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Record sale (Shopkeeper)
exports.recordSale = async (req, res) => {
    try {
        const { quantity, cashReceived, totalAmount } = req.body;

        const sale = await ShopSale.create({
            shopkeeperId: req.userId,
            quantity,
            cashReceived,
            changeReturned: cashReceived - totalAmount,
            totalAmount
        });

        // Also add to finance incoming
        await FinanceIncoming.create({
            source: 'shop_sale',
            amount: totalAmount,
            shopkeeperId: req.userId,
            description: `Shop sale - ${quantity} units`
        });

        const populated = await ShopSale.findById(sale._id)
            .populate('shopkeeperId', 'fullName');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get daily sales report
exports.getDailySales = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let query = {
            date: { $gte: today }
        };

        if (req.user.role === 'shopkeeper') {
            query.shopkeeperId = req.userId;
        }

        const sales = await ShopSale.find(query).populate('shopkeeperId', 'fullName');

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
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
