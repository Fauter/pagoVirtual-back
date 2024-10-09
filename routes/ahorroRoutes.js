const express = require('express');
const { body, validationResult } = require('express-validator');
const AhorroControllers = require('../controllers/ahorroControllers'); 
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const Ahorro = require('../models/Ahorro');
const router = express.Router();

router.post('/crear', 
    authMiddleware,
    roleMiddleware('userAhorrador'), 
    [
        body('direccion').not().isEmpty().withMessage('La dirección es requerida'),
        body('nombre').not().isEmpty().withMessage('El nombre es requerido'),
        body('monto').isNumeric().withMessage('El monto debe ser un número'),
        body('fechaPago').isISO8601().withMessage('Fecha de pago inválida'),
        body('repetir').not().isEmpty().withMessage('El Tipo de Pago es Requerido'), 
        body('periodos').isInt().withMessage('Los periodos deben ser un número entero'),
        body('cvuOrigen').isLength({ min: 22, max: 22 }).withMessage('El CVU de origen debe tener exactamente 22 caracteres'),
        body('cvuDestino').isLength({ min: 22, max: 22 }).withMessage('El CVU de destino debe tener exactamente 22 caracteres')
    ], 
    AhorroControllers.crearAhorro
);

router.get('/', authMiddleware, AhorroControllers.obtenerAhorros);
router.get('/todos', authMiddleware, AhorroControllers.obtenerTodosLosAhorros);

router.delete('/todos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const resultado = await Ahorro.findByIdAndDelete(id);
        if (!resultado) {
            return res.status(404).send('Ahorro no encontrado');
        }
        res.send('Ahorro eliminado correctamente');
    } catch (error) {
        console.error('Error al eliminar el ahorro:', error);
        res.status(500).send('Error al eliminar el ahorro');
    }
});


module.exports = router;
