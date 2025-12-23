const Order = require('../models/Order');

// Get orders (filtered by role)
exports.getOrders = async (req, res) => {
    try {
        let query = {};

        // Filter based on role
        if (req.user.role === 'customer') {
            query.customerId = req.userId;
        } else if (req.user.role === 'supplier') {
            query.supplierId = req.userId;
        }
        // Admin sees all orders

        const orders = await Order.find(query)
            .populate('customerId', 'fullName phone address')
            .populate('supplierId', 'fullName phone')
            .sort({ orderDate: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create order (Customer)
exports.createOrder = async (req, res) => {
    try {
        const { quantity, deliveryDate, address, notes } = req.body;

        const order = await Order.create({
            customerId: req.userId,
            quantity,
            deliveryDate,
            address,
            notes
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('customerId', 'fullName phone address');

        // Emit real-time event (Socket.IO will be configured in server.js)
        if (req.app.get('io')) {
            req.app.get('io').emit('newOrder', populatedOrder);
        }

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update order  (Admin)
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const order = await Order.findByIdAndUpdate(id, updates, { new: true })
            .populate('customerId', 'fullName phone address')
            .populate('supplierId', 'fullName phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Emit real-time update
        if (req.app.get('io')) {
            req.app.get('io').emit('orderUpdated', order);
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign order to supplier (Admin)
exports.assignOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplierId } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { supplierId, status: 'assigned' },
            { new: true }
        ).populate('customerId supplierId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
