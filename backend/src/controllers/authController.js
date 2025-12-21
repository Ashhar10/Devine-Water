import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email (check both users and customers tables)
        let user = null;
        let userType = null;

        // Check in users table first (Admin/User)
        const userQuery = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userQuery.rows.length > 0) {
            user = userQuery.rows[0];
            userType = 'user';
        } else {
            // Check in customers table
            const customerQuery = await pool.query(
                'SELECT * FROM customers WHERE email = $1',
                [email]
            );

            if (customerQuery.rows.length > 0) {
                user = customerQuery.rows[0];
                userType = 'customer';
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is active
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
        }

        // Verify password (PLAINTEXT as per request)
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = password === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyToken = async (req, res) => {
    // If we reach here, token is valid (verified by authMiddleware)
    res.json({
        success: true,
        user: req.user,
    });
};
