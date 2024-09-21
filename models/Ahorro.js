const mongoose = require('mongoose');

const ahorroSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoria: { type: String, required: true },
    nombre: { type: String, required: true },
    icono: { type: String, required: true }, // Podés usar una URL o SVG como string
    montoAhorro: { type: Number, required: true }, // Integer
    fechaInicio: { type: Date, required: true },
    fechaPago: { type: Date, required: true },
    ejecutarHasta: { type: Boolean, default: false }, // Si desea que se repita
    periodos: { type: Number, required: true }, // Cuotas
    cvu: { type: String, required: true }, // CVU, CBU o alias
});

module.exports = mongoose.model('Ahorro', ahorroSchema);