const roleMiddleware = (...roles) => {
    return ( req, res, next) => {
        const userRoles = req.user.roles; // roles del usuario
        console.log("Roles del usuario:", userRoles); // Ver los roles del usuario
        console.log("Roles requeridos:", roles); // Ver los roles requeridos

        if (!roles.some(role => userRoles.includes(role))) {
            return res.status(403).json({ msg: "Acceso Denegado: No tenes permisos" });
        }
        next();
    };
};

module.exports = roleMiddleware;