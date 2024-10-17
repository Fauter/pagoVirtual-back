const mongoose = require('mongoose');

const ahorroSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    direccion: { type: String, required: true },
    nombre: { type: String, required: true },
    monto: { type: Number, required: true }, // Integer
    fechaPago: { type: Date, required: true },
    repetir: { type: String, default: false }, // Si desea que se repita
    periodos: { type: Number, required: true }, 
    cuotas: { type: Number, required: false },
    cvuOrigen: { type: String, required: true, minlength: 22, maxlength: 22 },
    cvuDestino: { type: String, required: true, minlength: 22, maxlength: 22 },
    historial: [{ fecha: Date, monto: Number }],
    estado: { type: String, enum: ['activo', 'pausado'], default: 'activo' },
});

module.exports = mongoose.model('Ahorro', ahorroSchema);