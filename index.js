const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ahorroRoutes = require('./routes/ahorroRoutes');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // pars JSON

// Conexión con la base de datos (MongoDB)
mongoose.connect(process.env.Mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true }) //Borrar las llaves para eliminar msj de consola
    .then(() => console.log("Conectando a MongoDB"))
    .catch(err => console.log(err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/auth/ahorros", ahorroRoutes);
app.use("/api/admin", adminRoutes);



// Ruta Raíz
app.get("/", (req, res) => {
    res.send("API Working!");
});

// Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`)
})


app.delete('/api/reset', async (req, res) => {
    try {
        // Eliminar todos los documentos de Usuarios y Ahorros
        await mongoose.connection.collection('users').deleteMany({});
        await mongoose.connection.collection('ahorros').deleteMany({});
        
        console.log("Colecciones reseteadas correctamente");
        res.send('Usuarios y Ahorros borrados correctamente');
    } catch (error) {
        console.log("Error al resetear las colecciones:", error);
        res.status(500).send('Error al resetear la base de datos');
    }
});