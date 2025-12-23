const { prisma } = require('../config/db');

// Get deliveries
exports.getDeliveries = async (req, res) => {
    try {
        const where = {};

        if (req.user.role === 'supplier') {
            where.supplierId = req.userId;
        }

        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                order: {
                    include: {
                        customer: { select: { id: true, fullName: true, phone: true, address: true } }
                    }
                },
                supplier: { select: { id: true, fullName: true, phone: true } }
            },
            orderBy: { deliveryDate: 'desc' }
        });

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = { status };
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }

        const delivery = await prisma.delivery.update({
            where: { id },
            data: updateData,
            include: {
                order: true,
                supplier: true
            }
        });

        // Update order status if delivery completed
        if (status === 'completed') {
            await prisma.order.update({
                where: { id: delivery.orderId },
                data: { status: 'delivered' }
            });
        }

        // Emit real-time update
        if (req.app.get('io')) {
            req.app.get('io').emit('deliveryUpdated', delivery);
        }

        res.json(delivery);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Delivery not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get supplier deliveries
exports.getSupplierDeliveries = async (req, res) => {
    try {
        const { id } = req.params;

        const deliveries = await prisma.delivery.findMany({
            where: { supplierId: id },
            include: { order: true },
            orderBy: { deliveryDate: 'desc' }
        });

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
