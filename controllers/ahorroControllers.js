const mongoose = require('mongoose');
const Ahorro = require('../models/Ahorro'); 
const User = require('../models/User');
const Movimiento = require('../models/Movimiento');
const { validationResult } = require('express-validator');
const moment = require('moment');

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
    try {
        const ahorros = await Ahorro.find({ userId: userId }).sort({ nombre: 1 });
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
        // Calcular la cantidad de días entre hoy y la fecha de pago
        const hoy = moment();
        const diferenciaDias = moment(fechaPago).diff(hoy, 'days');
        // Calcular la cantidad de cuotas
        const cuotas = Math.floor(diferenciaDias / periodos);

        if (cuotas <= 0) {
            return res.status(400).json({ message: 'La cantidad de cuotas debe ser mayor a 0' });
        }

        const nuevoAhorro = new Ahorro({
            userId: userId,
            direccion,
            nombre,
            monto,
            fechaPago,
            repetir,
            periodos,
            cuotas: cuotas,
            cvuOrigen,
            cvuDestino,
            historial: []
        });

        const ahorroGuardado = await nuevoAhorro.save();
        const montoPorCuota = Math.round((monto / cuotas) * 100) / 100;
        
        const nuevoMovimiento = new Movimiento({
            ahorroId: ahorroGuardado._id,
            fecha: hoy.toDate(),
            monto: montoPorCuota
        })
        const primerMovimiento = await nuevoMovimiento.save();

        ahorroGuardado.historial.push({
            fecha: primerMovimiento.fecha,
            monto: primerMovimiento.monto
        });
        await ahorroGuardado.save();

        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (!Array.isArray(usuario.ahorros)) {
            usuario.ahorros = [];
        }
        usuario.ahorros.push(ahorroGuardado._id);
        await usuario.save();
        
        res.status(201).json({
            message: 'Ahorro creado con éxito y primer movimiento registrado',
            ahorro: ahorroGuardado,
            primerMovimiento
        });
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

