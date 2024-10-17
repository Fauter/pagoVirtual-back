const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    ahorroId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ahorro',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);