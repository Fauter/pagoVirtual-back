const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingresa un correo válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    roles: {
        type: [String],
        default: ["userAhorrador"]
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", UserSchema);