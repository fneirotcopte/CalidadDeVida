const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middlewares/multerconfig');
const verificarToken = require('../middlewares/verificarToken');
const autorizarRol = require('../middlewares/autorizarRol');
const fs = require('fs');
const path = require('path');

router.post('/registrar',
  verificarToken,
  autorizarRol(['administrador', 'administrativo']),
  (req, res, next) => {
    upload.fields([
      { name: 'foto_perfil', maxCount: 1 },
      { name: 'dni_frente', maxCount: 1 },
      { name: 'dni_dorso', maxCount: 1 },
      { name: 'cert_residencia', maxCount: 1 },
      { name: 'cert_salud', maxCount: 1 },
      { name: 'cert_conducta', maxCount: 1 },
      { name: 'carnet_frente', maxCount: 1 },   // 👈 agregado
      { name: 'carnet_dorso', maxCount: 1 }     // 👈 agregado
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      next();
    });

  },
  async (req, res) => {
    try {
      console.log('📂 Archivo recibido:', req.file);
      console.log('📝 Body recibido:', req.body);

      let documentosRequeridos = ['foto_perfil', 'dni_frente', 'dni_dorso', 'cert_residencia'];

      // tipo_titular determina qué documentos pedir
      if (req.body.tipo_titular === 'transporte') {
        documentosRequeridos.push('carnet_frente', 'carnet_dorso');
      } else {
        documentosRequeridos.push('cert_salud');
      }

      // si es comercio con food truck, también pedimos cert_conducta
      if (req.body.tipo_titular === 'comercio' && req.body.habilitaFoodTruck === 'true') {
        documentosRequeridos.push('cert_conducta');
      }

      for (const doc of documentosRequeridos) {
        if (!req.files || !req.files[doc]) {
          return res.status(400).json({
            success: false,
            error: `El documento ${doc} es requerido`
          });
        }
      }

      const {
        nombre, apellido, dni, cuit, razon_social, domicilio,
        telefono, correo_electronico, tipo_titular
      } = req.body;

      // Validación básica
      if (!nombre || !apellido || !dni || !domicilio || !telefono || !correo_electronico || !tipo_titular) {
        fs.unlinkSync(path.join(__dirname, '../uploads/documents', req.file.filename));
        return res.status(400).json({
          success: false,
          error: 'Faltan campos obligatorios'
        });
      }

      let result;

      if (tipo_titular === 'comercio') {
        // 👉 Determinar si es persona física o jurídica
        const personaFisica = req.body.es_juridica === 'no' ? 1 : 0;

        // 👉 Insertar en razon_social
        [result] = await db.query(
          `INSERT INTO razon_social 
    (nombre, apellido, dni, cuit, razon_social, domicilio, telefono, correo_electronico, persona_fisica, vinculo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nombre, apellido, dni,
            cuit || null, razon_social || null,
            domicilio, telefono, correo_electronico,
            personaFisica,
            req.body.vinculo || 'dueño'
          ]
        );

        // 👇 Guardar documentos en documentacion_titular (para comercio)
        if (req.files) {
          const documentos = Object.keys(req.files);
          for (const tipo of documentos) {
            const archivo = req.files[tipo][0];
            const rutaArchivo = path.posix.join('uploads/documentos_titular', archivo.filename);

            await db.query(
              `INSERT INTO documentacion_titular 
          (id_razon_social, id_titular_ambulante, tipo_documento, ruta_archivo) 
         VALUES (?, ?, ?, ?)`,
              [
                result.insertId, // comercio
                null,
                tipo,
                rutaArchivo
              ]
            );
          }
        }



      } else if (tipo_titular === 'ambulante') {
        // 👉 Insertar en titular_ambulante (siempre persona física)
        [result] = await db.query(
          `INSERT INTO titular_ambulante 
    (nombre, apellido, dni, domicilio, telefono, correo_electronico) 
    VALUES (?, ?, ?, ?, ?, ?)`,
          [
            nombre, apellido, dni,
            domicilio, telefono, correo_electronico
          ]
        );

        // 👇 Guardar documentos en documentacion_titular (para ambulante)
        if (req.files) {
          const documentos = Object.keys(req.files);
          for (const tipo of documentos) {
            const archivo = req.files[tipo][0];
            const rutaArchivo = path.posix.join('uploads/documentos_titular', archivo.filename);

            await db.query(
              `INSERT INTO documentacion_titular 
          (id_razon_social, id_titular_ambulante, tipo_documento, ruta_archivo) 
         VALUES (?, ?, ?, ?)`,
              [
                null,
                result.insertId, // ambulante
                tipo,
                rutaArchivo
              ]
            );
          }
        }

      } else if (tipo_titular === 'transporte') {
        // 👉 Insertar en titular_ambulante (igual que ambulante)
        [result] = await db.query(
          `INSERT INTO titular_ambulante 
      (nombre, apellido, dni, domicilio, telefono, correo_electronico, tipo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [nombre, apellido, dni, domicilio, telefono, correo_electronico, 'transporte']
        );

        // 👇 Guardar documentos en documentacion_titular
        if (req.files) {
          const documentos = Object.keys(req.files);
          for (const tipo of documentos) {
            const archivo = req.files[tipo][0];
            const rutaArchivo = path.posix.join('uploads/documentos_titular', archivo.filename);

            await db.query(
              `INSERT INTO documentacion_titular 
          (id_razon_social, id_titular_ambulante, tipo_documento, ruta_archivo) 
         VALUES (?, ?, ?, ?)`,
              [null, result.insertId, tipo, rutaArchivo]
            );
          }
        }

      } else {
        return res.status(400).json({
          success: false,
          error: 'Tipo de titular no válido'
        });
      }

      res.json({
        success: true,
        id_titular: result.insertId,   // 👈 unificado para comercio y ambulante
        message: 'Titular registrado exitosamente'
      });


    } catch (err) {
      console.error('Error en el servidor:', err);

      // Eliminar archivo si existe
      if (req.file) {
        fs.unlinkSync(path.join(__dirname, '../uploads/documents', req.file.filename));
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
);

// ===============================
// 📂 Obtener documentación de un titular
// ===============================
router.get('/documentos/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = (req.query.tipo || '').toLowerCase();

    let query = '';
    let values = [];

    if (tipo === 'vendedor ambulante') {
      query = 'SELECT tipo_documento, ruta_archivo FROM documentacion_titular WHERE id_titular_ambulante = ?';
      values = [id];
    } else {
      query = 'SELECT tipo_documento, ruta_archivo FROM documentacion_titular WHERE id_razon_social = ?';
      values = [id];
    }

    const [rows] = await db.query(query, values);

    // Armar objeto { clave: ruta }
    const docs = {};
    rows.forEach(r => {
      // 🔑 Ejemplo: tipo_documento = 'dni_frente'
      docs[r.tipo_documento] = '/' + r.ruta_archivo.replace(/\\/g, '/');
    });

    res.json(docs);
  } catch (err) {
    console.error('Error al obtener documentación:', err);
    res.status(500).json({ error: 'Error al obtener documentos del titular' });
  }
});

module.exports = router;