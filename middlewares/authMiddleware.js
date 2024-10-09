const jwt = require("jsonwebtoken");
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "").trim() : req.header("x-auth-token");

    if (!token) return res.status(401).json({ msg: "No hay token. Permiso no concedido." });

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.user.id).select("roles _id");
        if (!req.user) return res.status(404).json({ msg: "Usuario no encontrado" })
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token inválido" });
    }
};

module.exports = authMiddleware;