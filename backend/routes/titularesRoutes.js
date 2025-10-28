const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middlewares/verificarToken');

// GET /api/titulares - Lista unificada de titulares (razon_social + titular_ambulante)
// Query params: tipo=(ambulante|razon_social|todos), busqueda, pagina, porPagina
router.get('/', verificarToken, async (req, res) => {
  try {
    const { tipo = 'todos', busqueda = '', pagina = 1, porPagina = 10 } = req.query;
    const offset = (pagina - 1) * porPagina;

    // Construir SELECTs separados y combinarlos con UNION ALL
    const params = [];

    // Condición de búsqueda para ambas tablas
    const like = `%${busqueda}%`;

    const selects = [];

    if (tipo === 'razon_social' || tipo === 'todos') {
      let sel = `
        SELECT
          'razon_social' AS tipo,
          rs.id_razon_social AS id,
          rs.razon_social AS razon_social_nombre,
          rs.nombre,
          rs.apellido,
          rs.dni,
          rs.domicilio,
          rs.telefono,
          rs.correo_electronico
        FROM razon_social rs
      `;
      if (busqueda) {
        sel += ` WHERE (rs.razon_social LIKE ? OR rs.nombre LIKE ? OR rs.apellido LIKE ? OR rs.dni LIKE ?)`;
        params.push(like, like, like, like);
      }
      selects.push(sel);
    }

    if (tipo === 'ambulante' || tipo === 'transporte' || tipo === 'todos') {
      let sel2 = `
        SELECT
          CASE 
            WHEN ta.tipo = 'transporte' THEN 'transporte'
            ELSE 'ambulante'
          END AS tipo,
          ta.id AS id,
          NULL AS razon_social_nombre,
          ta.nombre,
          ta.apellido,
          ta.dni,
          ta.domicilio,
          ta.telefono,
          ta.correo_electronico
        FROM titular_ambulante ta
      `;
      
      // Agregar WHERE según el tipo seleccionado
      let whereClause = [];
      if (tipo === 'ambulante') {
        whereClause.push("ta.tipo = 'ambulante'");
      } else if (tipo === 'transporte') {
        whereClause.push("ta.tipo = 'transporte'");
      }
      
      if (busqueda) {
        whereClause.push("(ta.nombre LIKE ? OR ta.apellido LIKE ? OR ta.dni LIKE ? OR ta.domicilio LIKE ?)");
        params.push(like, like, like, like);
      }
      
      if (whereClause.length > 0) {
        sel2 += ` WHERE ${whereClause.join(' AND ')}`;
      }
      
      selects.push(sel2);
    }

    const unionQuery = selects.join('\nUNION ALL\n');

    // Query principal con paginación
    const query = `SELECT * FROM ( ${unionQuery} ) AS t ORDER BY t.razon_social_nombre IS NULL, t.razon_social_nombre, t.apellido, t.nombre LIMIT ? OFFSET ?`;
    const queryParams = params.concat([Number(porPagina), Number(offset)]);
    const [rows] = await db.query(query, queryParams);

    // Total
    const countQuery = `SELECT COUNT(*) AS total FROM ( ${unionQuery} ) AS t`;
    const [[total]] = await db.query(countQuery, params);

    res.json({ data: rows, total: total.total, pagina: Number(pagina), porPagina: Number(porPagina) });
  } catch (err) {
    console.error('Error en GET /api/titulares:', err);
    res.status(500).json({ error: 'Error al obtener titulares', detalles: err.message });
  }
});

module.exports = router;
