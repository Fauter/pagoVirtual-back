
// node updateUserRole.js en la consola para correr

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

console.log('Mongo URI:', process.env.Mongo_URI);

// Conexión a Database
mongoose.connect(process.env.Mongo_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on('connected', () => {
    console.log('Conectado a la base de datos MongoDB');
});
mongoose.connection.on('error', (err) => {
    console.error('Error de conexión a la base de datos:', err);
});

const updateUserRole = async () => {
    try {
        // Actualiza el rol del usuario
        const user = await User.findByIdAndUpdate(
            '66ec49572a11cf3bbc68d707', // Reemplaza con el ID del usuario
            { $addToSet: { roles: 'admin' } }, // Agrega el rol 'admin'
            { new: true }
        );
        console.log('Usuario actualizado:', user);
    } catch (error) {
        console.error('Error al actualizar el rol:', error);
    } finally {
        // Cierra la conexión a la base de datos
        mongoose.connection.close();
    }
};

updateUserRole();