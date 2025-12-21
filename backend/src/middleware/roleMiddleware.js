export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;

        // Convert to array if single role provided
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: roles,
                userRole: userRole,
            });
        }

        next();
    };
};

// Specific middleware functions
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);
export const requireCustomer = requireRole('CUSTOMER');
export const requireUser = requireRole('USER');
