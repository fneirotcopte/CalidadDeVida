// controllers/renovacionTransporteController.js
const pool = require('../db');
const path = require('path');
const fs = require('fs');

// ==============================
// 🔍 Obtener transporte por número de habilitación (con datos del titular)
// ==============================
exports.obtenerTransportePorId = async (req, res) => {
  try {
    const { id_transporte } = req.query;

    if (!id_transporte) {
      return res.status(400).json({ error: 'Falta el parámetro id_transporte' });
    }

    const [rows] = await pool.query(
      `SELECT 
        t.id_transporte,
        t.id_titular_ambulante,
        t.nombre_chofer,
        t.dni_chofer,
        t.carnet_chofer,
        t.telefono_chofer,
        t.tipo_vehiculo,
        t.tipo_alimento,
        t.patente,
        t.vto_fecha,
        t.seguro_fecha,
        t.monto_sellado,
        t.meses_adelantados,
        t.monto_total,
        t.fecha_habilitacion,
        t.fecha_vencimiento,
        t.numero_vehiculo,
        ta.nombre AS nombre_titular,
        ta.apellido AS apellido_titular,
        ta.dni AS dni_titular
      FROM transporte t
      JOIN titular_ambulante ta ON t.id_titular_ambulante = ta.id
      WHERE t.id_transporte = ?`,
      [id_transporte]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transporte no encontrado' });
    }

    const transporte = rows[0];

    const [docs] = await pool.query(`
      SELECT dt1.*
      FROM documentacion_transporte dt1
      INNER JOIN (
        SELECT tipo_documento, MAX(id_documento) AS ultimo_id
        FROM documentacion_transporte
        WHERE id_transporte = ?
        GROUP BY tipo_documento
      ) dt2 ON dt1.id_documento = dt2.ultimo_id
      ORDER BY dt1.tipo_documento ASC
    `, [id_transporte]);

    return res.json({
      ...transporte,
      documentacion: docs || [],
      nombre_completo_titular: `${transporte.nombre_titular} ${transporte.apellido_titular}`,
      dni_titular: transporte.dni_titular,
    });

  } catch (error) {
    console.error('Error en obtenerTransportePorId:', error);
    return res.status(500).json({ error: 'Error al obtener transporte' });
  }
};

// ==============================
// ♻️ Actualizar renovación de transporte (réplica exacta del flujo de alta)
// ==============================
exports.actualizarRenovacionTransporte = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_transporte,
      nombre_chofer,
      dni_chofer,
      carnet_chofer,
      telefono_chofer,
      tipo_vehiculo,
      tipo_alimento,
      patente,
      vto_fecha,
      seguro_fecha,
      monto_sellado,
      meses_adelantados,
      monto_total
    } = req.body;

    const id_empleado_registro = req.usuario?.id_empleado || null;

    const [[existe]] = await conn.query(
      "SELECT numero_renovacion FROM transporte WHERE id_transporte = ?",
      [id_transporte]
    );
    if (!existe) {
      return res.status(404).json({ message: "Transporte no encontrado." });
    }

    const numeroRenovacionActual = Number(existe.numero_renovacion || 0);
    const nuevoNumeroRenovacion = numeroRenovacionActual + 1;

   // 👉 Normalizaciones numéricas
        const meses = Number.parseInt(meses_adelantados, 10) || 1;
        const montoSellado = Number.parseFloat(monto_sellado) || 0;
        const montoTotal = Number.parseFloat(monto_total) || 0;

        // 👉 Fechas habilitación / vencimiento (idéntico criterio a comercio)
        const fechaHabilitacion = new Date();
        const fechaVencimiento = new Date(fechaHabilitacion);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);

    await conn.query(
      `UPDATE transporte SET
        nombre_chofer = ?, 
        dni_chofer = ?, 
        carnet_chofer = ?, 
        telefono_chofer = ?, 
        tipo_vehiculo = ?, 
        tipo_alimento = ?, 
        patente = ?, 
        vto_fecha = ?, 
        seguro_fecha = ?, 
        monto_sellado = ?, 
        meses_adelantados = ?, 
        monto_total = ?, 
        fecha_habilitacion = ?, 
        fecha_vencimiento = ?, 
        id_empleado_registro = ?, 
        numero_renovacion = ? 
      WHERE id_transporte = ?`,
      [
        nombre_chofer || null,
        dni_chofer || null,
        carnet_chofer || null,
        telefono_chofer || null,
        tipo_vehiculo,
        tipo_alimento,
        (patente || '').toString().trim().toUpperCase(),
        vto_fecha || null,
        seguro_fecha || null,
        montoSellado,
        meses,
        montoTotal,
        fechaHabilitacion,
        fechaVencimiento,
        id_empleado_registro,
        nuevoNumeroRenovacion,
        id_transporte
      ]
    );

    // === DOCUMENTACIÓN (idéntica al alta, adaptada a .fields()) ===
if (req.files && Object.keys(req.files).length > 0) {
  const carpetaDestino = path.join("uploads", "documentos_transporte");
  fs.mkdirSync(carpetaDestino, { recursive: true });

  // Recorremos todos los tipos de documentos cargados
  for (const tipoDoc in req.files) {
    const archivo = req.files[tipoDoc][0]; // cada campo tiene un solo archivo
    const extension = path.extname(archivo.originalname).toLowerCase();
    const nuevoNombre = `${tipoDoc}_${id_transporte}_R${nuevoNumeroRenovacion}${extension}`;
    const rutaDestino = path.join(carpetaDestino, nuevoNombre);

    // mover archivo desde uploads/renovaciones
    if (archivo?.path && fs.existsSync(archivo.path)) {
      fs.renameSync(archivo.path, rutaDestino);
    } else {
      console.warn(`⚠️ Archivo temporal no encontrado: ${archivo?.path}`);
      continue;
    }

    const rutaPublica = rutaDestino.replace(/\\/g, "/");
    await conn.query(
      `INSERT INTO documentacion_transporte (id_transporte, tipo_documento, ruta_archivo)
       VALUES (?, ?, ?)`,
      [id_transporte, tipoDoc, rutaPublica]
    );
  }
}

    await conn.commit();

    return res.json({
      success: true,
      message: "Renovación de transporte actualizada correctamente.",
      numero_renovacion: nuevoNumeroRenovacion,
      fecha_habilitacion: fechaHabilitacion,
      fecha_vencimiento: fechaVencimiento
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al actualizar renovación:", error);
    return res.status(500).json({ message: "Error al actualizar renovación.", error: error.message });
  } finally {
    conn.release();
  }
};
