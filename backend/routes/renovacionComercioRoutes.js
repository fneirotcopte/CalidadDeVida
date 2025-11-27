const express = require('express');
const router = express.Router();

const { 
  obtenerComercioPorId, 
  actualizarRenovacionComercio 
} = require('../controllers/renovacionComercioController');

const uploadRenovacionComercio = require('../middlewares/uploadRenovacionComercio');
const verificarToken = require('../middlewares/verificarToken'); // ✅ igual que transporte

// 🔍 Obtener comercio por número de habilitación (idéntico a transporte)
router.get('/datos', obtenerComercioPorId);

// ♻️ Actualizar renovación con documentación nueva (idéntico a transporte)
router.post(
  '/actualizar',
  verificarToken, // ✅ asegura autenticación igual que transporte
  uploadRenovacionComercio.fields([
    { name: 'doc_declaracion_rentas', maxCount: 1 },
    { name: 'sellado_bromatologico', maxCount: 1 },
    { name: 'doc_plano', maxCount: 1 },
    { name: 'doc_alquiler', maxCount: 1 },
    { name: 'doc_seguridad', maxCount: 1 },
    { name: 'doc_bomberos', maxCount: 1 },
    { name: 'doc_manipulacion', maxCount: 1 },
    { name: 'doc_seguro', maxCount: 1 },
    { name: 'doc_permiso', maxCount: 1 },
    { name: 'doc_frentista', maxCount: 1 }
  ]),
  actualizarRenovacionComercio
);

module.exports = router;
