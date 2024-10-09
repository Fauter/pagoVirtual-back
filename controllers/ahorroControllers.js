const mongoose = require('mongoose');
const Ahorro = require('../models/Ahorro'); 
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.obtenerTodosLosAhorros = async (req, res) => {
    try {
        const ahorros = await Ahorro.find(); 
        res.json(ahorros);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error en el servidor");
    }
};

exports.obtenerAhorros = async (req, res) => {
    const userId = req.user._id;
    console.log('User ID:', userId);
    try {
        const ahorros = await Ahorro.find({ userId: userId }).sort({ nombre: 1 });
        console.log('Ahorros encontrados:', ahorros);
        res.json(ahorros);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error en el servidor");
    }
};

exports.crearAhorro = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array().map(error => error.msg).join(', ') });
    }

    const { direccion, nombre, monto, fechaPago, repetir, periodos, cvuOrigen, cvuDestino } = req.body;
    const userId = req.user.id;
    console.log('User ID:', userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID de usuario no válido' });
    }

    try {
        const nuevoAhorro = new Ahorro({
            userId: userId,
            direccion,
            nombre,
            monto,
            fechaPago,
            repetir,
            periodos,
            cvuOrigen,
            cvuDestino
        });

        const ahorroGuardado = await nuevoAhorro.save();
        const usuario = await User.findById(userId);
        usuario.ahorros.push(ahorroGuardado._id);
        await usuario.save(); 

        res.status(201).json(ahorroGuardado);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

exports.eliminarAhorro = async (req, res) => {
    const { id } = req.params; 
    const userId = req.user.id;

    try {
        const ahorroEncontrado = await Ahorro.findOneAndDelete({ _id: id, userId: userId });
        if (!ahorroEncontrado) {
            return res.status(404).json({ message: 'Ahorro no encontrado' });
        }
        await User.findByIdAndUpdate(
            userId,
            { $pull: { ahorros: ahorroEncontrado._id } },
            { new: true }
        );
        res.status(200).json({ message: 'Ahorro eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el ahorro:', error.message);
        res.status(500).send('Error en el servidor');
    }
};

