const User = require("../models/User");
const Ahorro = require('../models/Ahorro');

//Actualizar Roles
const updateUserRole = async (req, res) => {
    const { userId, roles } = req.body; // El admin manda el userId y los roles deseados en el body
    try {
        await User.findByIdAndUpdate(userId, { roles: roles });
        res.status(200).json({ msg: "Roles actualizados exitosamente" });
    }   catch (err) {
        res.status(500).json({ msg: "Error al actualizar roles", error: err.message });
    }
};

const eliminarTodo = async (req, res) => {
    console.log('Eliminando todos los usuarios y ahorros...');
    try {
        await User.deleteMany(); // Elimina todos los usuarios
        await Ahorro.deleteMany(); // Elimina todos los ahorros
        res.status(200).json({ msg: 'Base de datos reiniciada con éxito' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error en el servidor');
    }
};

module.exports = {
    updateUserRole,
    eliminarTodo
};