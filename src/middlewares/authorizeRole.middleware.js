const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Not authorized, no role' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Not authorized as ${req.user.role}` });
        }
        next();
    };
};

module.exports = { authorizeRoles };



