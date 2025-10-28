const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const autorizarRol = require('../middlewares/autorizarRol');
const upload = require('../middlewares/multerconfig');
const comercioController = require('../controllers/comercioController');

// GET /api/comercios (con paginación y filtros)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { categoria, rubro, busqueda, estado, pagina = 1, porPagina = 10 } = req.query;
    const offset = (pagina - 1) * porPagina;

    // Base query con COALESCE para manejar NULLs
    // let query = `
    //   SELECT 
    //     c.id_comercio,
    //     c.nombre_comercial,
    //     COALESCE(rs.razon_social, 'No registrada') AS razon_social,
    //     c.categoria,
    //     COALESCE(c.rubro, 'No especificado') AS rubro,
    //     c.pendiente_inspeccion,
    //       -- Preferir el titular ambulante cuando exista, si no usar razon_social
    //       CASE
    //         WHEN c.id_titular_ambulante IS NOT NULL THEN CONCAT(ta.nombre, ' ', ta.apellido, ' (', ta.dni, ')')
    //         WHEN rs.persona_fisica = 1 THEN CONCAT(rs.nombre, ' ', rs.apellido, ' (', rs.dni, ')')
    //         ELSE COALESCE(rs.razon_social, 'Titular no registrado')
    //       END AS titular,
    //     c.direccion,
    //     c.telefono,
    //     c.fecha_vencimiento,
    //     c.activo
    //   FROM comercio c
    //   LEFT JOIN razon_social rs ON c.id_razon_social = rs.id_razon_social
    //   LEFT JOIN titular_ambulante ta ON c.id_titular_ambulante = ta.id
    //   WHERE 1=1
    // `;
    //     let query = `
    //   SELECT 
    //     c.id_comercio,
    //     c.nombre_comercial,
    //     COALESCE(rs.razon_social, 'No registrada') AS razon_social,
    //     c.categoria,
    //     COALESCE(c.rubro, 'No especificado') AS rubro,
    //     c.pendiente_inspeccion,
    //     -- Titular (nombre visible)
    //     CASE
    //       WHEN c.id_titular_ambulante IS NOT NULL THEN CONCAT(ta.nombre, ' ', ta.apellido)
    //       WHEN rs.persona_fisica = 1 THEN CONCAT(rs.nombre, ' ', rs.apellido)
    //       ELSE COALESCE(rs.razon_social, 'Titular no registrado')
    //     END AS titular,
    //     -- DNI (unificado)
    //     COALESCE(ta.dni, rs.dni) AS dni,
    //     c.direccion,
    //     c.telefono,
    //     c.fecha_vencimiento,
    //     c.activo
    //   FROM comercio c
    //   LEFT JOIN razon_social rs ON c.id_razon_social = rs.id_razon_social
    //   LEFT JOIN titular_ambulante ta ON c.id_titular_ambulante = ta.id
    //   WHERE 1=1
    // `;
    let query = `
      SELECT 
        c.id_comercio,
        c.nombre_comercial,
        c.categoria,
        COALESCE(c.rubro, 'No especificado') AS rubro,
        c.pendiente_inspeccion,

        -- TITULAR: prioriza titular_ambulante si existe, de lo contrario usa razón social o persona física
        CASE
          WHEN c.id_titular_ambulante IS NOT NULL THEN CONCAT(ta.nombre, ' ', ta.apellido)
          WHEN rs.persona_fisica = 1 THEN CONCAT(rs.nombre, ' ', rs.apellido)
          ELSE COALESCE(rs.razon_social, 'Titular no registrado')
        END AS titular,

        -- DNI: obtiene de titular_ambulante o razon_social (si persona física)
        COALESCE(ta.dni, rs.dni) AS dni,

        c.direccion,
        c.telefono,
        c.fecha_vencimiento,
        c.activo

      FROM comercio c
      LEFT JOIN razon_social rs ON c.id_razon_social = rs.id_razon_social
      LEFT JOIN titular_ambulante ta ON c.id_titular_ambulante = ta.id
      WHERE 1=1
    `;


    const params = [];
    const whereConditions = [];

    // Filtros (se combinan con AND)
    if (categoria) {
      whereConditions.push('c.categoria = ?');
      params.push(categoria);
    }
    if (rubro) {
      whereConditions.push('c.rubro = ?');
      params.push(rubro);
    }
    if (busqueda) {
      // Buscar por nombre comercial, razón social o datos del titular ambulante (nombre, apellido, dni)
      whereConditions.push('(c.nombre_comercial LIKE ? OR rs.razon_social LIKE ? OR ta.nombre LIKE ? OR ta.apellido LIKE ? OR ta.dni LIKE ?)');
      const like = `%${busqueda}%`;
      params.push(like, like, like, like, like);
    }
    
    // Filtro por estado de vencimiento
    if (estado) {
      const hoy = new Date().toISOString().split('T')[0];
      switch(estado) {
        case 'vigente':
          whereConditions.push('(c.fecha_vencimiento IS NULL OR c.fecha_vencimiento > DATE_ADD(?, INTERVAL 30 DAY))');
          params.push(hoy);
          break;
        case 'proximo-30':
          whereConditions.push('c.fecha_vencimiento BETWEEN ? AND DATE_ADD(?, INTERVAL 30 DAY)');
          params.push(hoy, hoy);
          break;
        case 'proximo-15':
          whereConditions.push('c.fecha_vencimiento BETWEEN ? AND DATE_ADD(?, INTERVAL 15 DAY)');
          params.push(hoy, hoy);
          break;
        case 'vencido':
          whereConditions.push('c.fecha_vencimiento < ?');
          params.push(hoy);
          break;
      }
    }

    // Aplicar condiciones WHERE
    if (whereConditions.length > 0) {
      query += ' AND ' + whereConditions.join(' AND ');
    }

    // Paginación
    query += ' ORDER BY c.nombre_comercial ASC LIMIT ? OFFSET ?';
    params.push(Number(porPagina), offset);

    // Consulta principal
    const [comercios] = await db.query(query, params);

    // Consulta para el total (excluyendo LIMIT/OFFSET)
// MODIFICAR LA CONSULTA DE CONTEO TAMBIÉN
let countQuery = `
  SELECT COUNT(*) AS total 
  FROM comercio c
  LEFT JOIN razon_social rs ON c.id_razon_social = rs.id_razon_social
  LEFT JOIN titular_ambulante ta ON c.id_titular_ambulante = ta.id
  WHERE 1=1
`;
    if (whereConditions.length > 0) {
      countQuery += ' AND ' + whereConditions.join(' AND ');
    }
    const [[total]] = await db.query(countQuery, params.slice(0, -2));

    res.json({
      data: comercios,
      total: total.total,
      pagina: Number(pagina),
      porPagina: Number(porPagina)
    });

  } catch (err) {
    console.error('Error en GET /api/comercios:', err);
    res.status(500).json({ 
      error: 'Error al obtener comercios',
      detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/comercios/:id - Detalle completo de un comercio (para la página comercio.html)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const [comercio] = await db.query(`
      SELECT 
        c.*,
        rs.razon_social,
        rs.nombre AS titular_nombre,
        rs.apellido AS titular_apellido,
        rs.dni AS titular_dni,
        rs.domicilio AS titular_domicilio,
        rs.telefono AS titular_telefono,
        rs.correo_electronico AS titular_email,
        rs.cuit,
        ta.nombre AS titular_ambulante_nombre,
        ta.apellido AS titular_ambulante_apellido,
        ta.dni AS titular_ambulante_dni,
        ta.domicilio AS titular_ambulante_domicilio,
        ta.telefono AS titular_ambulante_telefono,
        ta.correo_electronico AS titular_ambulante_email,
        CONCAT(e.nombre, ' ', e.apellido) AS inspector_registro
      FROM comercio c
      LEFT JOIN razon_social rs ON c.id_razon_social = rs.id_razon_social
      LEFT JOIN titular_ambulante ta ON c.id_titular_ambulante = ta.id
      LEFT JOIN empleado e ON c.id_empleado_registro = e.id_empleado
      WHERE c.id_comercio = ?
    `, [req.params.id]);

    if (!comercio[0]) return res.status(404).json({ error: 'Comercio no encontrado' });
    
    // Asegurar formato consistente
    const resultado = {
      ...comercio[0],
      correo_electronico: comercio[0].correo_electronico || comercio[0].titular_email,
      activo: Boolean(comercio[0].activo)
    };

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al obtener comercio',
      detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// PUT /api/comercios/:id/estado
router.put('/:id/estado', verificarToken, autorizarRol(['administrador']), async (req, res) => {
  try {
    await db.query('UPDATE comercio SET activo = ? WHERE id_comercio = ?', 
      [req.body.activo, req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/comercios/:id - Editar comercio
router.put('/:id', verificarToken, autorizarRol(['administrador', 'administrativo']), async (req, res) => {
  try {
    const { 
      nombre_comercial, 
      direccion, 
      telefono, 
      correo_electronico, 
      rubro, 
      categoria, 
      metros_cuadrados
    } = req.body;
    
    await db.query(
      `UPDATE comercio 
       SET nombre_comercial = ?, 
           direccion = ?, 
           telefono = ?, 
           correo_electronico = ?,
           rubro = ?, 
           categoria = ?,
           metros_cuadrados = ?
       WHERE id_comercio = ?`,
      [
        nombre_comercial, 
        direccion, 
        telefono, 
        correo_electronico,
        rubro, 
        categoria,
        metros_cuadrados,
        req.params.id
      ]
    );
    
    res.json({ mensaje: 'Comercio actualizado correctamente' });
  } catch (err) {
    console.error('Error detallado:', err);
    res.status(500).json({ 
      error: 'Error al actualizar comercio',
      detalles: err.message
    });
  }
});

// DELETE /api/comercios/:id - Baja lógica de comercio
router.delete('/:id', verificarToken, autorizarRol(['administrador', 'administrativo']), async (req, res) => {
  try {
    await db.query('UPDATE comercio SET activo = 0 WHERE id_comercio = ?', [req.params.id]);
    res.json({ mensaje: 'Comercio dado de baja correctamente' });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error al dar de baja el comercio',
      detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/comercios/registrar - Registrar nuevo comercio
router.post('/registrar', 
  verificarToken,
  upload.fields([
    { name: 'dni_titular', maxCount: 1 },
    { name: 'certificado_residencia', maxCount: 1 },
    { name: 'foto_titular', maxCount: 1 }
  ]),
  comercioController.registrarComercio
);

// POST /api/comercios/:id/renovar - Renovar habilitación
router.post('/:id/renovar',
  verificarToken,
  autorizarRol(['administrador', 'administrativo']),
  upload.fields([
    { name: 'cuil_razon_social', maxCount: 1 },
    { name: 'certificado_buena_salud', maxCount: 1 },
    { name: 'certificado_residencia', maxCount: 1 },
    { name: 'contrato_actualizado', maxCount: 1 },
    { name: 'verificacion_tecnica', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const idComercio = req.params.id;

      // Validar comercio existente
      const [rows] = await db.query('SELECT id_comercio, fecha_vencimiento, rubro FROM comercio WHERE id_comercio = ?', [idComercio]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Comercio no encontrado' });
      }

      // Validar archivos requeridos
      const archivos = req.files || {};
      const faltantes = [];
      if (!archivos.cuil_razon_social || archivos.cuil_razon_social.length === 0) faltantes.push('Cuil Razon Social');
      if (!archivos.certificado_buena_salud || archivos.certificado_buena_salud.length === 0) faltantes.push('Certificado de buena salud');
      if (!archivos.certificado_residencia || archivos.certificado_residencia.length === 0) faltantes.push('Certificado de residencia');
      if (!archivos.contrato_actualizado || archivos.contrato_actualizado.length === 0) faltantes.push('Contrato actualizado');

      // Verificación técnica solo si el rubro es Bar
      const rubro = rows[0].rubro || '';
      const requiereVT = /bar/i.test(rubro);
      if (requiereVT && (!archivos.verificacion_tecnica || archivos.verificacion_tecnica.length === 0)) {
        faltantes.push('Verificación técnica');
      }

      if (faltantes.length > 0) {
        return res.status(400).json({ error: 'Faltan documentos requeridos', faltantes });
      }

      // Actualizar fecha de vencimiento: un año desde hoy
      await db.query(
        'UPDATE comercio SET fecha_vencimiento = DATE_ADD(CURDATE(), INTERVAL 1 YEAR) WHERE id_comercio = ?',
        [idComercio]
      );

      // Devolver rutas guardadas
      const respuestaArchivos = {
        cuil_razon_social: archivos.cuil_razon_social?.[0]?.path || null,
        certificado_buena_salud: archivos.certificado_buena_salud?.[0]?.path || null,
        certificado_residencia: archivos.certificado_residencia?.[0]?.path || null,
        contrato_actualizado: archivos.contrato_actualizado?.[0]?.path || null,
        verificacion_tecnica: archivos.verificacion_tecnica?.[0]?.path || null
      };

      res.status(200).json({ mensaje: 'Renovación realizada', documentos: respuestaArchivos });
    } catch (err) {
      console.error('Error en renovación:', err);
      res.status(500).json({ error: 'Error al renovar habilitación', detalles: err.message });
    }
  }
);

module.exports = router;