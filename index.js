const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
app.use(express.json()); // pars JSON

// Conexión con la base de datos (MongoDB)
mongoose.connect(process.env.Mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true }) //Borrar las llaves para eliminar msj de consola
    .then(() => console.log("Conectando a MongoDB"))
    .catch(err => console.log(err));

// Rutas
app.use("/api/auth", authRoutes);
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
