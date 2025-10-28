const express = require('express');
const router = express.Router();
const altaTransporteController = require('../controllers/altaTransporteController');
const verificarToken = require('../middlewares/verificarToken');
const upload = require('../middlewares/multerAltaTransporte');

// ==============================
// 🚛 Registrar nuevo transporte (con documentos)
// ==============================
router.post('/registrar',
    verificarToken,
    upload.fields([
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

    altaTransporteController.registrarTransporteCompleto
);

// ==============================
// 🧾 Generar QR del transporte (idéntico a comercio)
// ==============================
router.get('/qr/:id', verificarToken, altaTransporteController.generarQR);

router.get('/vehiculo-siguiente', verificarToken, altaTransporteController.vehiculoSiguiente);

// Verificar si una patente ya existe (normalizada en mayúsculas)
router.get('/existe-patente', verificarToken, altaTransporteController.existePatente);


module.exports = router;
