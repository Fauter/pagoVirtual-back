const Movimiento = require('../models/Movimiento'); 
const Ahorro = require('../models/Ahorro'); 

// Crear un nuevo movimiento para un Ahorro
exports.crearMovimiento = async (req, res) => {
    const { id } = req.params;
    
    try {
        const ahorro = await Ahorro.findById(ahorroId);

        if (!ahorro) {
            return res.status(404).json({ message: 'Ahorro no encontrado' });
        }

        const montoPorCuota = ahorro.monto / ahorro.cuotas;

        const nuevoMovimiento = new Movimiento({
            ahorroId: ahorro._id,
            fecha: new Date(),
            monto: montoPorCuota
        });

        // Guardar el movimiento en la base de datos
        const movimientoGuardado = await nuevoMovimiento.save();

        ahorro.historial.push({
            fecha: movimientoGuardado.fecha,
            monto: movimientoGuardado.monto
        });

        await ahorro.save();

        res.status(201).json({
            message: 'Movimiento creado con éxito',
            movimiento: movimientoGuardado
        });
    } catch (error) {
        console.error('Error al crear el movimiento:', error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};