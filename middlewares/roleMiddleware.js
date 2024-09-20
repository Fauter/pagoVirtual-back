const roleMiddleware = (...roles) => {
    return ( req, res, next) => {
        const userRoles = req.user.roles;
        if (!roles.some(role => userRoles.includes(role))) {
            return res.status(403).json({ msg:"Acceso Denegado: No tenes permisos"})
        }
        next();
    };
};

module.exports = roleMiddleware;