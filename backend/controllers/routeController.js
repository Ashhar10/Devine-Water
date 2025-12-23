const Route = require('../models/Route');

// Get routes
exports.getRoutes = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'supplier') {
            query.supplierId = req.userId;
        }

        const routes = await Route.find(query)
            .populate('supplierId', 'fullName phone')
            .populate('customers.customerId', 'fullName phone address')
            .sort({ date: -1 });

        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create route (Admin)
exports.createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        const populated = await Route.findById(route._id)
            .populate('supplierId customers.customerId');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update route
exports.updateRoute = async (req, res) => {
    try {
        const { id } = req.params;

        const route = await Route.findByIdAndUpdate(id, req.body, { new: true })
            .populate('supplierId customers.customerId');

        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        res.json(route);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get routes by date
exports.getRoutesByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date);

        const routes = await Route.find({
            date: {
                $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
                $lt: new Date(targetDate.setHours(23, 59, 59, 999))
            }
        })
            .populate('supplierId customers.customerId');

        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
