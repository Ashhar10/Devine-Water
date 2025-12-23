const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                fullName: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create user (Admin only)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role, fullName, phone, address } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role,
                fullName,
                phone,
                address
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                fullName: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true
            }
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If password is being updated, hash it
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updates,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                fullName: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true
            }
        });

        res.json(user);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
