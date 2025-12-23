const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// Get deliveries
exports.getDeliveries = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'supplier') {
            query.supplierId = req.userId;
        }

        const deliveries = await Delivery.find(query)
            .populate({
                path: 'orderId',
                populate: { path: 'customerId', select: 'fullName phone address' }
            })
            .populate('supplierId', 'fullName phone')
            .sort({ deliveryDate: -1 });

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

            // Update order status
            const delivery = await Delivery.findById(id);
            if (delivery) {
                await Order.findByIdAndUpdate(delivery.orderId, { status: 'delivered' });
            }
        }

        const delivery = await Delivery.findByIdAndUpdate(id, updateData, { new: true })
            .populate('orderId supplierId');

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Emit real-time update
        if (req.app.get('io')) {
            req.app.get('io').emit('deliveryUpdated', delivery);
        }

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get supplier deliveries
exports.getSupplierDeliveries = async (req, res) => {
    try {
        const { id } = req.params;

        const deliveries = await Delivery.find({ supplierId: id })
            .populate('orderId')
            .sort({ deliveryDate: -1 });

        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
