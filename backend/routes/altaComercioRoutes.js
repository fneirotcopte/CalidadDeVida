const express = require('express');
const router = express.Router();
const altaComercioController = require('../controllers/altaComercioController');
const verificarToken = require('../middlewares/verificarToken');
const upload = require('../middlewares/multerAltaComercio');

// Obtener titulares para el select
router.get('/titulares', verificarToken, altaComercioController.getTitulares);

// Obtener titulares ambulantes para el select
router.get('/titulares-ambulantes', verificarToken, altaComercioController.getTitularesAmbulantes);

router.get('/sucursal-siguiente', verificarToken, altaComercioController.getSiguienteNumeroSucursal);

router.get('/qr/:id', verificarToken, altaComercioController.generarQR);

// Registrar nuevo comercio (con documentos)
router.post('/registrar', 
    verificarToken,
    upload.fields([
        // Documentos comunes a todas las categorías
        { name: 'sellado_bromatologico', maxCount: 1 },
        { name: 'doc_declaracion_rentas', maxCount: 1 },

        // Comercio en general
        { name: 'doc_plano', maxCount: 1 },
        { name: 'doc_alquiler', maxCount: 1 },

        // Bares nocturnos, confiterías y restaurantes
        { name: 'doc_seguridad', maxCount: 1 },
        { name: 'doc_bomberos', maxCount: 1 },

        // Food truck
        { name: 'doc_manipulacion', maxCount: 1 },
        { name: 'doc_seguro', maxCount: 1 },
        { name: 'doc_permiso', maxCount: 1 },

        // Vendedor ambulante
        { name: 'doc_frentista', maxCount: 1 }
    ]),
    altaComercioController.registrarComercioCompleto
);

module.exports = router;