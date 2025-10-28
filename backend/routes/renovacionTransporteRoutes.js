const express = require('express');
const router = express.Router();

const { 
  obtenerTransportePorId, 
  actualizarRenovacionTransporte 
} = require('../controllers/renovacionTransporteController');

const uploadRenovacion = require('../middlewares/uploadRenovacion');
const verificarToken = require('../middlewares/verificarToken'); // ✅ agregado

// 🔍 Obtener transporte por número de habilitación
router.get('/datos', obtenerTransportePorId);

// ♻️ Actualizar renovación con documentación nueva
router.post(
  '/actualizar',
  verificarToken, // ✅ asegura que solo usuarios autenticados puedan renovar
  uploadRenovacion.fields([
    { name: 'dni_frente', maxCount: 1 },
    { name: 'dni_dorso', maxCount: 1 },
    { name: 'carnet_frente', maxCount: 1 },
    { name: 'carnet_dorso', maxCount: 1 },
    { name: 'cert_salud', maxCount: 1 },
    { name: 'foto_vehiculo', maxCount: 1 },
    { name: 'cedula_verde', maxCount: 1 },
    { name: 'seguro_vehiculo', maxCount: 1 },
    { name: 'vto_vehiculo', maxCount: 1 },
    { name: 'sellado_bromatologico', maxCount: 1 }
  ]),
  actualizarRenovacionTransporte
);

module.exports = router;
