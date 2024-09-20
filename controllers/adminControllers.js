const User = require("../models/User");

//Actualizar Roles
const updateUserRole = async (req, res) => {
    const { userId, roles } = req.body; // El admin manda el userId y los roles deseados en el body
    try {
        await User.findByIdAndUpdate(userId, { roles: roles });
        res.status(200).json({ msg: "Roles actualizados exitosamente" });
    }   catch (err) {
        res.status(500).json({ msg: "Error al actualizar roles", error: err.message });
    }
}

module.exports = {
    updateUserRole
};