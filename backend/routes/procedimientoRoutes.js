// const express = require('express');
// const router = express.Router();
// const db = require('../db');
// const verificarToken = require('../middlewares/verificarToken');
// const autorizarRol = require('../middlewares/autorizarRol');
// const upload = require('../middlewares/multerconfig');

// // GET /api/procedimientos - Listar con filtros
// router.get('/', verificarToken, async (req, res) => {
//   try {
//     const { comercio } = req.query;
    
//     let query = `
//       SELECT p.*, CONCAT(e.nombre, ' ', e.apellido) AS inspector_nombre
//       FROM procedimiento p
//       LEFT JOIN empleado e ON p.id_inspector = e.id_empleado
//       WHERE 1=1
//     `;
    
//     const params = [];
    
//     if (comercio) {
//       query += ' AND p.id_comercio = ?';
//       params.push(comercio);
//     }
    
//     query += ' ORDER BY p.fecha_procedimiento DESC';
    
//     const [procedimientos] = await db.query(query, params);
//     res.json(procedimientos);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/procedimientos/:id - Obtener un procedimiento
// router.get('/:id', verificarToken, async (req, res) => {
//   try {
//     const [procedimiento] = await db.query(`
//       SELECT p.*, CONCAT(e.nombre, ' ', e.apellido) AS inspector_nombre
//       FROM procedimiento p
//       LEFT JOIN empleado e ON p.id_inspector = e.id_empleado
//       WHERE p.id_procedimiento = ?
//     `, [req.params.id]);
    
//     if (!procedimiento[0]) return res.status(404).json({ error: 'Procedimiento no encontrado' });
//     res.json(procedimiento[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// // POST /api/procedimientos - Crear nuevo procedimiento
// /*
// router.post('/', 
//   verificarToken,
//   autorizarRol(['inspector']),
//   upload.array('fotos', 5), // Máximo 5 fotos
//   async (req, res) => {
//     try {
//       const { tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, id_comercio, id_inspector } = req.body;
      
//       // Verificar si hay archivos subidos
//       /*
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ error: 'No se subieron archivos' });
//       }
      
//       const fotos = req.files.map(file => file.filename).join(',') || [];
     


//       await db.query(
//         `INSERT INTO procedimiento 
//         (tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector]
//       );
      
//       res.json({ mensaje: 'Procedimiento registrado correctamente' });
//     } catch (err) {
//       // Manejar errores específicos de Multer
//       if (err.code === 'LIMIT_FILE_SIZE') {
//         return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
//       }
//       if (err.message.includes('Solo se permiten imágenes')) {
//         return res.status(400).json({ error: err.message });
//       }
      
//       console.error('Error al registrar procedimiento:', err);
//       res.status(500).json({ error: 'Error al registrar el procedimiento' });
//     }
//   }
// ); 
// */

// // POST /api/procedimientos - Crear nuevo procedimiento
// router.post('/', 
//   verificarToken,
//   autorizarRol(['inspector']),
//   upload.array('fotos', 5), // Middleware Multer (pero ahora será opcional)
//   async (req, res) => {
//     try {
//       const { tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, id_comercio, id_inspector } = req.body;
      
//       // Manejar fotos (opcional)
//       const fotos = req.files ? req.files.map(file => file.filename).join(',') : null; // Cambiado a null si no hay archivos

//       await db.query(
//         `INSERT INTO procedimiento 
//         (tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector]
//       );
      
//       res.json({ mensaje: 'Procedimiento registrado correctamente' });
//     } catch (err) {
//       // Manejar errores específicos de Multer (solo si se subieron archivos)
//       if (req.files) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//           return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
//         }
//         if (err.message.includes('Solo se permiten imágenes')) {
//           return res.status(400).json({ error: err.message });
//         }
//       }
      
//       console.error('Error al registrar procedimiento:', err);
//       res.status(500).json({ error: 'Error al registrar el procedimiento' });
//     }
//   }
// );

// module.exports = router;


const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const autorizarRol = require('../middlewares/autorizarRol');
const uploadProcedimientos = require('../middlewares/multerProcedimientos'); 




// GET /api/procedimientos - Listar con filtros
router.get('/', verificarToken, async (req, res) => {
  try {
    const { comercio } = req.query;
    
    let query = `
      SELECT p.*, CONCAT(e.nombre, ' ', e.apellido) AS inspector_nombre
      FROM procedimiento p
      LEFT JOIN empleado e ON p.id_inspector = e.id_empleado
      WHERE 1=1
    `;
    
    const params = [];
    
    if (comercio) {
      query += ' AND p.id_comercio = ?';
      params.push(comercio);
    }
    
    query += ' ORDER BY p.fecha_procedimiento DESC';
    
    const [procedimientos] = await db.query(query, params);
    res.json(procedimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// GET /api/procedimientos/:id - Obtener un procedimiento
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const [procedimiento] = await db.query(`
      SELECT p.*, CONCAT(e.nombre, ' ', e.apellido) AS inspector_nombre
      FROM procedimiento p
      LEFT JOIN empleado e ON p.id_inspector = e.id_empleado
      WHERE p.id_procedimiento = ?
    `, [req.params.id]);
    
    if (!procedimiento[0]) return res.status(404).json({ error: 'Procedimiento no encontrado' });
    res.json(procedimiento[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// POST /api/procedimientos - Crear nuevo procedimiento
router.post('/', 
  verificarToken,
  autorizarRol(['inspector']),
  uploadProcedimientos.array('fotos', 5), // ← USA EL NUEVO MULTER
  async (req, res) => {
    const connection = await db.getConnection();
    try {
      console.log('=== 🚀 INICIO REGISTRO PROCEDIMIENTO ===');
      console.log('📦 Body recibido:', req.body);
      console.log('📁 Archivos recibidos (req.files):', req.files ? req.files.length : 0);
      
      // DIAGNÓSTICO DETALLADO DE ARCHIVOS
      if (!req.files) {
        console.log('❌ req.files es NULL o UNDEFINED - Multer no procesó archivos');
      } else if (req.files.length === 0) {
        console.log('⚠️  req.files existe pero está VACÍO (no se subieron archivos)');
      } else {
        console.log(`✅ req.files tiene ${req.files.length} archivos:`);
        req.files.forEach((file, index) => {
          console.log(`   Archivo ${index + 1}:`, {
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size + ' bytes',
            mimetype: file.mimetype,
            destination: file.destination
          });
          
          // Verificar si el archivo se guardó físicamente
          const fs = require('fs');
          if (fs.existsSync(file.path)) {
            console.log(`   ✅ Archivo guardado físicamente en: ${file.path}`);
          } else {
            console.log(`   ❌ ARCHIVO NO ENCONTRADO en: ${file.path}`);
          }
        });
      }

      await connection.beginTransaction();

      const { tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, id_comercio, id_inspector } = req.body;
      
      // Manejar fotos con validación extendida
      let fotos = null;
      if (req.files && req.files.length > 0) {
        fotos = req.files.map(file => {
          console.log(`💾 Guardando referencia en BD: ${file.filename}`);
          console.log(`📍 Ruta física: ${file.path}`);
          return file.filename;
        }).join(',');
        console.log('📸 Cadena de fotos para BD:', fotos);
      } else {
        console.log('📭 No hay archivos para guardar en BD');
        fotos = null;
      }

      // 1. Insertar el procedimiento
      console.log('🗃️ Insertando en base de datos...');
      const [result] = await connection.query(
        `INSERT INTO procedimiento 
        (tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tipo_procedimiento, fecha_procedimiento, resultado, observacion, documentacion, fotos, id_comercio, id_inspector]
      );

      console.log('✅ Procedimiento guardado en BD con ID:', result.insertId);
      console.log('📸 Fotos guardadas en BD:', fotos);

      // 2. Lógica para inspección ocular
      if (tipo_procedimiento === 'inspeccion-ocular' && resultado === 'Aprobado') {
        console.log(`🔄 Actualizando estado del comercio ${id_comercio} después de inspección ocular aprobada`);
        
        const fechaHabilitacion = new Date().toISOString().split('T')[0];
        const fechaVencimiento = new Date();
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
        const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0];
        
        await connection.query(
          `UPDATE comercio 
           SET pendiente_inspeccion = 0, 
               activo = 1,
               fecha_habilitacion = ?,
               fecha_vencimiento = ?
           WHERE id_comercio = ?`,
          [fechaHabilitacion, fechaVencimientoStr, id_comercio]
        );
        
        console.log(`✅ Comercio ${id_comercio} actualizado: inspección aprobada, fechas actualizadas`);
      } else if (tipo_procedimiento === 'inspeccion-ocular' && resultado !== 'Aprobado') {
        // Si la inspección no fue aprobada, mantenemos pendiente_inspeccion en 1
        console.log(`⚠️ Inspección ocular no aprobada para comercio ${id_comercio}`);
      }

      await connection.commit();
      
      console.log('=== ✅ REGISTRO COMPLETADO EXITOSAMENTE ===');
      
      res.json({ 
        mensaje: 'Procedimiento registrado correctamente' + 
                (tipo_procedimiento === 'inspeccion-ocular' ? ' y comercio activado' : ''),
        id_procedimiento: result.insertId,
        fotos_guardadas: fotos,
        total_archivos: req.files ? req.files.length : 0,
        ubicacion_archivos: '/uploads/procedimientos/'
      });
      
    } catch (err) {
      await connection.rollback();
      console.error('❌ ERROR en registro de procedimiento:', err);
      
      // Manejar errores específicos de Multer
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 10MB)' });
      }
      if (err.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'ENOENT') {
        return res.status(500).json({ error: 'Error de directorio: No se pudo guardar el archivo' });
      }
      
      res.status(500).json({ error: 'Error al registrar el procedimiento: ' + err.message });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;