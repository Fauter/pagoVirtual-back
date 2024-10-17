const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ahorroRoutes = require('./routes/ahorroRoutes');
const Movimiento = require('./models/Movimiento');
const Ahorro = require('./models/Ahorro');
const moment = require('moment');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // pars JSON

// Conexión con la base de datos (MongoDB)
mongoose.connect(process.env.Mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true }) 
    .then(() => console.log("Conectando a MongoDB"))
    .catch(err => console.log(err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/auth/ahorros", ahorroRoutes);
app.use("/api/admin", adminRoutes);

// Ruta Raíz
app.get("/", (req, res) => {
    res.send("API Working!");
});

// Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`)
})

// RESET DATABASE
app.delete('/api/reset', async (req, res) => {
    try {
        // Eliminar todos los documentos de Usuarios y Ahorros
        await mongoose.connection.collection('users').deleteMany({});
        await mongoose.connection.collection('ahorros').deleteMany({});
        
        console.log("Colecciones reseteadas correctamente");
        res.send('Usuarios y Ahorros borrados correctamente');
    } catch (error) {
        console.log("Error al resetear las colecciones:", error);
        res.status(500).send('Error al resetear la base de datos');
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

cron.schedule('0 0 * * *', async () => { // Ejecuta todos los días a la medianoche
    console.log("Cron job ejecutado");
    try {
        const ahorros = await Ahorro.find({ estado: 'activo' });

        for (const ahorro of ahorros) {
            const hoy = moment().startOf('day');
            const fechaUltimoPago = moment(ahorro.historial[ahorro.historial.length - 1]?.fecha || ahorro.fechaPago).startOf('day');
            const diasDesdeUltimoPago = hoy.diff(fechaUltimoPago, 'days');

            if (diasDesdeUltimoPago >= ahorro.periodos) {
                const cuotasRestantes = ahorro.periodos - ahorro.historial.length;

                if (cuotasRestantes > 0) {
                    const montoPorCuota = ahorro.monto / ahorro.periodos;
                    const nuevoMovimiento = new Movimiento({
                        ahorroId: ahorro._id,
                        fecha: hoy.toDate(),
                        monto: montoPorCuota,
                    });
                    await nuevoMovimiento.save();

                    ahorro.historial.unshift({
                        fecha: nuevoMovimiento.fecha,
                        monto: nuevoMovimiento.monto,
                    }); 
                    await ahorro.save();
                    console.log(`Movimiento de ${montoPorCuota} creado para el ahorro ${ahorro.nombre}`);
                }
                else {
                    if (ahorro.repetir === "Único") {
                        ahorro.estado = "pausado";
                        await ahorro.save();
                        console.log(`Ahorro ${ahorro.nombre} pausado porque alcanzó su límite de cuotas.`);
                    } else if (ahorro.repetir === "Recursivo") {
                        console.log(`Ahorro ${ahorro.nombre} es recursivo y continuará generando movimientos.`);
                    }
                }
            }
            else {
                console.log(`Ahorro ${ahorro.nombre} finalizado y no se repite.`);
            }
        }
    } catch (error) {
        console.error("Error al ejecutar el cron job:", error);
    }
});

let ultimaFechaSimulada = moment().startOf('day');
app.post('/api/simular-dia', async (req, res) => {
    try {
        const ahorros = await Ahorro.find();
        const diasParaSimular = req.body.dias || 1;

        ultimaFechaSimulada = ultimaFechaSimulada.add(diasParaSimular, 'days');
        console.log(`Simulando hasta: ${ultimaFechaSimulada.format('YYYY-MM-DD')}`); 

        for (const ahorro of ahorros) {
            let fechaUltimoPago = moment(ahorro.historial[ahorro.historial.length - 1]?.fecha || ahorro.fechaPago).startOf('day');
            let diasDesdeUltimoPago = ultimaFechaSimulada.diff(fechaUltimoPago, 'days');
            console.log(`Días desde el último pago para ${ahorro.nombre}: ${diasDesdeUltimoPago}`);

            // Verifica si deben generarse nuevos movimientos
            if (diasDesdeUltimoPago >= ahorro.periodos) {
                const cuotasRestantes = ahorro.cuotas - ahorro.historial.length;
                const montoPorCuota = Math.round((ahorro.monto / ahorro.cuotas) * 100) / 100;
                
                if (cuotasRestantes > 0) {                   
                    const nuevoMovimiento = new Movimiento({
                        ahorroId: ahorro._id,
                        fecha: ultimaFechaSimulada.toDate(), 
                        monto: montoPorCuota,
                    });
                    await nuevoMovimiento.save();
                    ahorro.historial.push({
                        fecha: nuevoMovimiento.fecha,
                        monto: nuevoMovimiento.monto,
                    }); 

                    await ahorro.save();
                    console.log(`Movimiento de ${montoPorCuota} creado para el ahorro ${ahorro.nombre}`);
                } 
                
                // Verifica si la fecha simulada coincide con la fecha de pago
                if (ultimaFechaSimulada.isSame(ahorro.fechaPago, 'day')) {
                    const cuotasRestantes = ahorro.cuotas - ahorro.historial.length;
                    if (cuotasRestantes === 0) {
                        const movimientoTransferencia = new Movimiento({
                            ahorroId: ahorro._id,
                            fecha: ultimaFechaSimulada.toDate(),
                            monto: 0,
                            descripcion: 'Ahorro transferido' 
                        });
                        await movimientoTransferencia.save();
    
                        ahorro.historial.push({
                            fecha: movimientoTransferencia.fecha,
                            monto: movimientoTransferencia.monto,
                        });


                        if (ahorro.repetir === "Único") {
                            ahorro.estado = 'pausado';
                            console.log(`Ahorro ${ahorro.nombre} ${ahorro.estado} y movimiento de transferencia creado.`);
                        } else if (ahorro.repetir === "Recursivo") {
                            let nuevaFechaPago = moment(ahorro.fechaPago).add(1, 'month');
                            const ultimoDiaDelMes = nuevaFechaPago.endOf('month').date();
                            if (nuevaFechaPago.date() > ultimoDiaDelMes) {
                                nuevaFechaPago.date(ultimoDiaDelMes);
                            }
                            ahorro.fechaPago = nuevaFechaPago.startOf('day').toDate();
                            console.log(`Ahorro ${ahorro.nombre} repetitivo, fecha de pago ajustada a: ${nuevaFechaPago.format('YYYY-MM-DD')}`);

                            // Generar un nuevo movimiento después de la transferencia
                            const montoPorCuota = Math.round((ahorro.monto / ahorro.cuotas) * 100) / 100;
                            const nuevoMovimiento = new Movimiento({
                                ahorroId: ahorro._id,
                                fecha: ultimaFechaSimulada.toDate(), 
                                monto: montoPorCuota,
                            });
                            await nuevoMovimiento.save();
                            ahorro.historial.push({
                                fecha: nuevoMovimiento.fecha,
                                monto: nuevoMovimiento.monto,
                            });
                            await ahorro.save();
                            console.log(`Movimiento de ${montoPorCuota} creado para el ahorro ${ahorro.nombre}`);
                        }
                        await ahorro.save();
                        // ahorro.estado = 'pausado';
                        // await ahorro.save();
                        // console.log(`Ahorro ${ahorro.nombre} pausado y movimiento de transferencia creado.`);
                    } else {
                        console.log(`No se puede transferir, cuotas restantes para ${ahorro.nombre}: ${cuotasRestantes}`);
                    }
                } 
            } else {
                console.log(`Ahorro ${ahorro.nombre} no necesita nuevos movimientos.`);
            }
        }
        res.json({
            mensaje: 'Simulación de día ejecutada.',
            fecha: ultimaFechaSimulada.format('YYYY-MM-DD'), 
        });
    } catch (error) {
        console.error("Error al simular el día:", error);
        res.status(500).send('Error al simular el día');
    }
});
