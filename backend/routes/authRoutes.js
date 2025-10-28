// Actualizar authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authController = require('../controllers/authController');
const autorizarRol = require('../middlewares/autorizarRol');
const verificarToken = require('../middlewares/verificarToken');
const { verificarDNIUnico } = require('../models/empleadoModel'); // Ajusta la ruta


// Ruta para registrar un nuevo usuario
router.post('/registrar', verificarToken, autorizarRol("administrador"), authController.registrar);

// Ruta para loguear un usuario
router.post('/login', authController.login);

// Ruta para eliminar usuario
router.delete('/eliminar', verificarToken, autorizarRol('administrador'), authController.eliminar);

// Ruta para actualizar usuario
router.put('/actualizar/:id_empleado', verificarToken, autorizarRol('administrador'), authController.actualizar);

// Ruta para desactivar usuario
router.put('/desactivar/:id_empleado', verificarToken, autorizarRol('administrador'), authController.desactivar);

// Ruta para activar usuario
router.put('/activar/:id_empleado', verificarToken, autorizarRol('administrador'), authController.activar);

// Agregar esta ruta al authRoutes.js
router.get('/usuarios', verificarToken, autorizarRol('administrador'), async (req, res) => {
  try {
    const [usuarios] = await db.query('SELECT id_empleado, nombre, apellido, dni, area, correo_electronico, rol, activo FROM empleado');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }

// Ruta para obtener un empleado por ID
router.get('/:id_empleado', verificarToken, autorizarRol('administrador'), authController.obtener);

});

router.get('/verificar-dni', async (req, res) => {
  const { dni, idExcluido } = req.query; // idExcluido es opcional (para edición)

  if (!dni || !/^\d{7,8}$/.test(dni)) {
    return res.status(400).json({ error: 'DNI inválido. Debe tener 7 u 8 dígitos.' });
  }

  try {
    const disponible = await verificarDNIUnico(dni, idExcluido || null);
    res.json({ disponible });
  } catch (error) {
    console.error('Error en verificar-dni:', error);
    res.status(500).json({ 
      error: 'Error interno al verificar el DNI',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});


module.exports = router;