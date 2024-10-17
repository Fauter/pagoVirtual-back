const Movimiento = require('../models/Movimiento'); // Asegúrate de importar el modelo correcto
const Ahorro = require('../models/Ahorro'); // Importar Ahorro si necesitas usarlo también

// Crear un nuevo movimiento para un Ahorro
exports.crearMovimiento = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Buscar el ahorro por su ID
        const ahorro = await Ahorro.findById(ahorroId);

        if (!ahorro) {
            return res.status(404).json({ message: 'Ahorro no encontrado' });
        }

        // Calcular el monto por cuota
        const montoPorCuota = ahorro.monto / ahorro.cuotas;

        // Crear un nuevo movimiento
        const nuevoMovimiento = new Movimiento({
            ahorroId: ahorro._id,
            fecha: new Date(), // Fecha actual
            monto: montoPorCuota
        });

        // Guardar el movimiento en la base de datos
        const movimientoGuardado = await nuevoMovimiento.save();

        // Agregar el movimiento al historial del ahorro
        ahorro.historial.push({
            fecha: movimientoGuardado.fecha,
            monto: movimientoGuardado.monto
        });

        // Guardar el ahorro actualizado
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