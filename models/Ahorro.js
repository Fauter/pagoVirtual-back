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
    periodos: { type: Number, required: true }, // Cuotas
    cvuOrigen: { type: String, required: true, minlength: 22, maxlength: 22 },
    cvuDestino: { type: String, required: true, minlength: 22, maxlength: 22 },
});

module.exports = mongoose.model('Ahorro', ahorroSchema);