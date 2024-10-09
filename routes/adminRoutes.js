const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { updateUserRole, eliminarTodo } = require("../controllers/adminControllers");

// Solo los administradores pueden actualizar roles
router.put("/update-role", authMiddleware, roleMiddleware('admin'), updateUserRole);
// router.delete('/reset', authMiddleware, roleMiddleware('admin'), eliminarTodo);
router.delete('/reset', eliminarTodo);

module.exports = router;