const { prisma } = require('../config/db');

// Get routes
exports.getRoutes = async (req, res) => {
    try {
        const where = {};

        if (req.user.role === 'supplier') {
            where.supplierId = req.userId;
        }

        const routes = await prisma.route.findMany({
            where,
            include: {
                supplier: { select: { id: true, fullName: true, phone: true } },
                routeCustomers: true
            },
            orderBy: { date: 'desc' }
        });

        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create route (Admin)
exports.createRoute = async (req, res) => {
    try {
        const { date, supplierId, customers, status } = req.body;

        const route = await prisma.route.create({
            data: {
                date: new Date(date),
                supplierId,
                status,
                routeCustomers: {
                    create: customers || []
                }
            },
            include: {
                supplier: true,
                routeCustomers: true
            }
        });

        res.status(201).json(route);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update route
exports.updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, status, customers } = req.body;

        const updateData = {};
        if (date) updateData.date = new Date(date);
        if (status) updateData.status = status;

        // Delete old route customers and create new ones if provided
        if (customers) {
            await prisma.routeCustomer.deleteMany({
                where: { routeId: id }
            });
            updateData.routeCustomers = {
                create: customers
            };
        }

        const route = await prisma.route.update({
            where: { id },
            data: updateData,
            include: {
                supplier: true,
                routeCustomers: true
            }
        });

        res.json(route);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get routes by date
exports.getRoutesByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const routes = await prisma.route.findMany({
            where: {
                date: {
                    gte: targetDate,
                    lt: nextDay
                }
            },
            include: {
                supplier: true,
                routeCustomers: true
            }
        });

        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
