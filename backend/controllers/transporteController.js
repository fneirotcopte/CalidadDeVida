const pool = require('../db'); // Conexión MySQL
const multer = require('multer');
const path = require('path');

/**
 * Registro de Transporte – réplica adaptada desde registrarComercio
 * Diferencias aplicadas:
 * - No existe CUIT / CUIL / nombre_comercial
 * - Se registra titular desde tabla titular_ambulante
 * - Se guardan datos del vehículo, chofer y alimento transportado
 * - Vencimiento mensual (30 días)
 */
exports.registrarTransporte = async (req, res) => {
  try {
    const {
      id_titular_ambulante,
      nombre_chofer,
      dni_chofer,
      carnet_chofer,
      telefono_chofer,
      tipo_vehiculo,
      tipo_alimento,
      patente,
      monto_sellado,
      meses_adelantados
    } = req.body;

    if (!id_titular_ambulante || !tipo_vehiculo || !tipo_alimento || !patente || !nombre_chofer) {
      return res.status(400).json({ error: "Faltan datos obligatorios para registrar transporte." });
    }

    const meses = meses_adelantados ? parseInt(meses_adelantados) : 1;
    const fecha_habilitacion = new Date();
    const fecha_vencimiento = new Date();
    fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + meses);

    const [result] = await pool.query(
      `INSERT INTO transporte (
        id_titular_ambulante,
        nombre_chofer,
        dni_chofer,
        carnet_chofer,
        telefono_chofer,
        tipo_vehiculo,
        tipo_alimento,
        patente,
        monto_sellado,
        meses_adelantados,
        fecha_habilitacion,
        fecha_vencimiento,
        activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id_titular_ambulante,
        nombre_chofer || null,
        dni_chofer || null,
        carnet_chofer || null,
        telefono_chofer || null,
        tipo_vehiculo,
        tipo_alimento,
        patente,
        monto_sellado || 0,
        meses,
        fecha_habilitacion,
        fecha_vencimiento
      ]
    );

    res.status(201).json({
      message: "Transporte registrado correctamente.",
      idTransporte: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar transporte." });
  }
};

/**
 * Obtener listado de transportes con filtros
 */
exports.obtenerTransportes = async (req, res) => {
  try {
    const { estado, tipo_vehiculo, patente, titular, numeroHabilitacion, pagina = 1, porPagina = 10 } = req.query;
    const offset = (pagina - 1) * porPagina;

    let query = `
      SELECT 
        t.id_transporte,
        CONCAT(ta.nombre, ' ', ta.apellido) AS titular_nombre,
        ta.dni AS titular_dni,
        t.tipo_vehiculo,
        t.tipo_alimento,
        t.patente,
        t.fecha_vencimiento,
        t.activo
      FROM transporte t
      LEFT JOIN titular_ambulante ta ON t.id_titular_ambulante = ta.id
      WHERE 1=1
    `;

    const params = [];
    const where = [];

    if (tipo_vehiculo) {
      where.push(`t.tipo_vehiculo = ?`);
      params.push(tipo_vehiculo);
    }

    if (patente) {
      where.push(`t.patente LIKE ?`);
      params.push(`%${patente}%`);
    }

    if (titular) {
      where.push(`(ta.nombre LIKE ? OR ta.apellido LIKE ? OR ta.dni LIKE ?)`);
      params.push(`%${titular}%`, `%${titular}%`, `%${titular}%`);
    }

    if (numeroHabilitacion) {
      where.push(`t.numero_vehiculo = ?`);
      params.push(numeroHabilitacion);
    }

    if (estado) {
      const hoy = new Date().toISOString().split('T')[0];
      if (estado === 'vigente') {
        where.push(`t.fecha_vencimiento > DATE_ADD(?, INTERVAL 10 DAY)`);
        params.push(hoy);
      } else if (estado === 'proximo-10') {
        where.push(`t.fecha_vencimiento BETWEEN ? AND DATE_ADD(?, INTERVAL 10 DAY)`);
        params.push(hoy, hoy);
      } else if (estado === 'vencido') {
        where.push(`t.fecha_vencimiento < ?`);
        params.push(hoy);
      }
    }

    if (where.length) query += ` AND ` + where.join(" AND ");
    query += ` ORDER BY ta.nombre ASC LIMIT ? OFFSET ?`;
    params.push(Number(porPagina), offset);

    const [resultados] = await pool.query(query, params);
    res.json({ data: resultados });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener listado de transportes." });
  }
};

/**
 * Obtener detalle de un transporte (réplica adaptada)
 */
exports.obtenerTransportePorId = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query(`
      SELECT 
        t.*,
        CONCAT(ta.nombre, ' ', ta.apellido) AS titular_nombre,
        ta.dni AS titular_dni,
        ta.telefono AS titular_telefono,
        ta.correo_electronico AS titular_email,
        CONCAT(e.nombre, ' ', e.apellido) AS inspector_registro
      FROM transporte t
      LEFT JOIN titular_ambulante ta ON t.id_titular_ambulante = ta.id
      LEFT JOIN empleado e ON t.id_empleado_registro = e.id_empleado
      WHERE t.id_transporte = ?
    `, [id]);

    if (!result[0]) return res.status(404).json({ error: 'Transporte no encontrado' });

    const respuesta = {
      ...result[0],
      activo: Boolean(result[0].activo)
    };

    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transporte' });
  }
};