const express = require('express');
const router = express.Router();
const db = require('../db');
const verificarToken = require('../middlewares/verificarToken');
const autorizarRol = require('../middlewares/autorizarRol');
const upload = require('../middlewares/multerconfig');
const transporteController = require('../controllers/transporteController');

// LISTADO de transportes (con filtros y paginación)
router.get('/', verificarToken, async (req, res) => {
    try {
        const { tipo_vehiculo, tipo_alimento, busqueda, estado, pagina = 1, porPagina = 10 } = req.query;
        const offset = (pagina - 1) * porPagina;

        let query = `
      SELECT 
        t.id_transporte,
        t.tipo_vehiculo,
        t.tipo_alimento,
        t.patente,
        CONCAT(ta.nombre, ' ', ta.apellido) AS titular_nombre,
        ta.dni AS titular_dni,
        t.fecha_vencimiento,
        t.activo
      FROM transporte t
      LEFT JOIN titular_ambulante ta ON t.id_titular_ambulante = ta.id
      WHERE 1=1
    `;

        const params = [];
        const whereConditions = [];

        if (tipo_vehiculo) {
            whereConditions.push('t.tipo_vehiculo = ?');
            params.push(tipo_vehiculo);
        }
        if (tipo_alimento) {
            whereConditions.push('t.tipo_alimento = ?');
            params.push(tipo_alimento);
        }
        if (busqueda) {
            whereConditions.push('(ta.nombre LIKE ? OR ta.apellido LIKE ? OR ta.dni LIKE ? OR t.patente LIKE ?)');
            params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
        }

        if (estado) {
            const hoy = new Date().toISOString().split('T')[0];
            switch (estado) {
                case 'vigente':
                    whereConditions.push('(t.fecha_vencimiento > DATE_ADD(?, INTERVAL 10 DAY))');
                    params.push(hoy);
                    break;
                case 'proximo-10':
                    whereConditions.push('(t.fecha_vencimiento BETWEEN ? AND DATE_ADD(?, INTERVAL 10 DAY))');
                    params.push(hoy, hoy);
                    break;
                case 'vencido':
                    whereConditions.push('t.fecha_vencimiento < ?');
                    params.push(hoy);
                    break;
            }
        }

        if (req.query.id_transporte) {
            whereConditions.push('t.id_transporte = ?');
            params.push(req.query.id_transporte);
        }

        if (req.query.patente) {
            whereConditions.push('t.patente LIKE ?');
            params.push(`%${req.query.patente}%`);
        }

        if (req.query.titular) {
            whereConditions.push('(CONCAT(ta.nombre, " ", ta.apellido) LIKE ? OR ta.dni LIKE ?)');
            params.push(`%${req.query.titular}%`, `%${req.query.titular}%`);
        }

        if (whereConditions.length > 0) {
            query += ' AND ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY ta.nombre ASC LIMIT ? OFFSET ?';
        params.push(Number(porPagina), offset);

        const [transportes] = await db.query(query, params);

        let countQuery = `
      SELECT COUNT(*) AS total
      FROM transporte t
      LEFT JOIN titular_ambulante ta ON t.id_titular_ambulante = ta.id
      WHERE 1=1
    `;
        if (whereConditions.length > 0) {
            countQuery += ' AND ' + whereConditions.join(' AND ');
        }

        const [[total]] = await db.query(countQuery, params.slice(0, -2));

        res.json({
            data: transportes,
            total: total.total,
            pagina: Number(pagina),
            porPagina: Number(porPagina)
        });

    } catch (err) {
        res.status(500).json({ error: 'Error al obtener transportes' });
    }
});

// DETALLE de transporte
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [transporte] = await db.query(`
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
    `, [req.params.id]);

        if (!transporte[0]) return res.status(404).json({ error: 'Transporte no encontrado' });

        res.json({
            ...transporte[0],
            activo: Boolean(transporte[0].activo)
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener transporte' });
    }
});

// CAMBIO de estado (activar/desactivar)
router.put('/:id/estado', verificarToken, autorizarRol(['administrador']), async (req, res) => {
    try {
        await db.query('UPDATE transporte SET activo = ? WHERE id_transporte = ?',
            [req.body.activo, req.params.id]
        );
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// EDICIÓN básica de transporte
router.put('/:id', verificarToken, autorizarRol(['administrador', 'administrativo']), async (req, res) => {
    try {
        const { tipo_vehiculo, tipo_alimento, patente, telefono_chofer } = req.body;

        await db.query(
            `UPDATE transporte
       SET tipo_vehiculo = ?, tipo_alimento = ?, patente = ?, telefono_chofer = ?
       WHERE id_transporte = ?`,
            [tipo_vehiculo, tipo_alimento, patente, telefono_chofer, req.params.id]
        );

        res.json({ mensaje: 'Transporte actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar transporte' });
    }
});

// BAJA lógica
router.delete('/:id', verificarToken, autorizarRol(['administrador', 'administrativo']), async (req, res) => {
    try {
        await db.query('UPDATE transporte SET activo = 0 WHERE id_transporte = ?', [req.params.id]);
        res.json({ mensaje: 'Transporte dado de baja correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al dar de baja el transporte' });
    }
});

// REGISTRO de transporte
router.post('/registrar',
    verificarToken,
    upload.fields([
        { name: 'licencia_chofer', maxCount: 1 }, // Adaptable si luego definís documentos
        { name: 'seguro', maxCount: 1 }
    ]),
    transporteController.registrarTransporte
);

module.exports = router;