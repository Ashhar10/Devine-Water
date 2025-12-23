const { prisma } = require('../config/db');

// Get orders (filtered by role)
exports.getOrders = async (req, res) => {
    try {
        const where = {};

        // Filter based on role
        if (req.user.role === 'customer') {
            where.customerId = req.userId;
        } else if (req.user.role === 'supplier') {
            where.supplierId = req.userId;
        }
        // Admin sees all orders

        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, fullName: true, phone: true, address: true }
                },
                supplier: {
                    select: { id: true, fullName: true, phone: true }
                }
            },
            orderBy: { orderDate: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create order (Customer)
exports.createOrder = async (req, res) => {
    try {
        const { quantity, deliveryDate, address, notes } = req.body;

        const order = await prisma.order.create({
            data: {
                customerId: req.userId,
                quantity,
                deliveryDate: new Date(deliveryDate),
                address,
                notes
            },
            include: {
                customer: {
                    select: { id: true, fullName: true, phone: true, address: true }
                }
            }
        });

        // Emit real-time event
        if (req.app.get('io')) {
            req.app.get('io').emit('newOrder', order);
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update order (Admin)
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.deliveryDate) {
            updates.deliveryDate = new Date(updates.deliveryDate);
        }

        const order = await prisma.order.update({
            where: { id },
            data: updates,
            include: {
                customer: {
                    select: { id: true, fullName: true, phone: true, address: true }
                },
                supplier: {
                    select: { id: true, fullName: true, phone: true }
                }
            }
        });

        // Emit real-time update
        if (req.app.get('io')) {
            req.app.get('io').emit('orderUpdated', order);
        }

        res.json(order);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign order to supplier (Admin)
exports.assignOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplierId } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: {
                supplierId,
                status: 'assigned'
            },
            include: {
                customer: true,
                supplier: true
            }
        });

        res.json(order);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.update({
            where: { id },
            data: { status: 'cancelled' }
        });

        res.json(order);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
