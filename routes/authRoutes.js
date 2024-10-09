const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userControllers');
const AhorroControllers = require('../controllers/ahorroControllers');

const User = require("../models/User");

const router = express.Router();

//Registro
router.post("/register", [
    //Validaciones
    body('firstName').not().isEmpty().withMessage('El nombre es requerido'),
    body('lastName').not().isEmpty().withMessage('El apellido es requerido'),
    body('email').isEmail().withMessage('Debe ingresar un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
        //Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        try {

            //Verificar si el usuario existe
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: "El email ya está en uso" });
            }

            //Crear nuevo user
            user = new User({
                firstName,
                lastName,
                email,
                password
            });

            //Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            //Guardar nuevo user en base de datos
            await user.save();

            //Generar token JWT con roles
            const payload = {
                user: {
                    id: user.id,
                    roles: user.roles
                }
            };
            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
            
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Error en el servidor");
        }
});

// Iniciar Sesión
router.post("/login", [
    //Validaciones
    body('email').isEmail().withMessage('Debe ingresar un correo válido'),
    body('password').exists().withMessage('La contraseña es requerida')
], async (req, res) => {
    //Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        //Verificar si el usuario existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Ese email no se encuentra registrado"})
        }

        //Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Contraseña Incorrecta" });
        }

        //Generar token JWT con roles
        const payload = {
            user: {
                id: user.id,
                roles: user.roles
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
});

router.post("/admin/login", [
    body('email').isEmail().withMessage('Debe ingresar un correo válido'),
    body('password').exists().withMessage('La contraseña es requerida')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Ese email no se encuentra registrado" });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Contraseña Incorrecta" });
        }
        // Verificar si el usuario tiene rol de admin
        if (!user.roles.includes("admin")) {
            return res.status(403).json({ msg: "Acceso prohibido. Solo los administradores pueden iniciar sesión." });
        }
        // Generar token JWT con roles
        const payload = {
            user: {
                id: user.id,
                roles: user.roles
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
});



//Ruta Protegidas por Middleware

//Ruta de Auth para Token
router.get("/profile", authMiddleware, async (req, res) => {
    try{
        //Accede a la info del user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "UserID no encontrado" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
})
router.get("/profile/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
})

//Ruta para admin
router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.send("Contenido solo para administradores");
});
//Ruta para userAhorrador
router.get("/ahorrador", authMiddleware, roleMiddleware("userAhorrador"), (req, res) => {
    res.send("Contenido solo para userAhorrador")
})
//Ruta para userCobrador
router.get("/Cobrador", authMiddleware, roleMiddleware("userCobrador"), (req, res) => {
    res.send("Contenido solo para userCobrador")
})

//Rutas de Users
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserById);
router.put("/users/:id", authMiddleware, roleMiddleware("admin"), updateUser);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

//Rutas de Ahorro
router.get('/', authMiddleware, AhorroControllers.obtenerAhorros);
router.post('/crear',
    [
        body('monto').isNumeric().withMessage('El monto debe ser un número'),
        body('direccion').not().isEmpty().withMessage('La dirección es requerida'),
        body('fechaPago').isISO8601().withMessage('Fecha de pago inválida'),
    ],
    AhorroControllers.crearAhorro
);

router.get("/dashboard", authMiddleware, roleMiddleware("admin"), (req, res) => {
    res.json({ msg: "Bienvenido al dashboard" });
});

module.exports = router;