const User = require('../models/User');

//Obtener la lista de usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
};

//Obtener Usuario por ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
};

//Eliminar Usuario
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "Usuario eliminado" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
}

//Actualizar Usuario
const updateUser = async (req, res) => {
    try {

        const { firstName, lastName, email, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json ({ msg: "Usuario no encontrado"});
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json(user);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };