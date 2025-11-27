// controllers/renovacionComercioController.js
const pool = require('../db');
const path = require('path');
const fs = require('fs');

// ==============================
// 🔍 Obtener comercio por número de habilitación (con datos del titular)
// ==============================
exports.obtenerComercioPorId = async (req, res) => {
    try {
        const { id_comercio } = req.query;

        if (!id_comercio) {
            return res.status(400).json({ error: 'Falta el parámetro id_comercio' });
        }

        const [rows] = await pool.query(
            `SELECT 
        c.id_comercio,
        c.nombre_comercial,
        c.sucursal,
        c.direccion,
        c.telefono,
        c.correo_electronico,
        c.rubro,
        c.id_razon_social,
        c.id_titular_ambulante,
        c.categoria,
        c.metros_cuadrados,
        c.id_empleado_registro,
        c.ruta_qr,
        c.fecha_registro,
        c.geolocalizacion,
        c.monto_sellado_inspeccion,
        c.estado_pago_final,
        c.activo,
        c.fecha_habilitacion,
        c.fecha_vencimiento,
        c.numero_renovacion,
        r.razon_social,
        r.nombre AS nombre_titular,
        r.apellido AS apellido_titular,
        r.dni AS dni_titular,
        r.cuit AS cuit_titular,
        r.telefono AS telefono_titular,
        r.correo_electronico AS correo_titular,
        r.persona_fisica
        FROM comercio c
        LEFT JOIN razon_social r ON c.id_razon_social = r.id_razon_social
        WHERE c.id_comercio = ?`,
            [id_comercio]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Comercio no encontrado' });
        }

        const comercio = rows[0];

        // 🟣 Si el comercio tiene titular ambulante, traemos sus datos
        let titularAmbulante = null;

        if (comercio.id_titular_ambulante) {
            const [titularRows] = await pool.query(
                `SELECT nombre, apellido, dni, telefono, correo_electronico 
                 FROM titular_ambulante 
                 WHERE id = ?`,
                [comercio.id_titular_ambulante]
            );

            if (titularRows.length > 0) {
                titularAmbulante = titularRows[0];
            }
        }


        const [docs] = await pool.query(`
      SELECT dc1.*
      FROM documentacion_comercio dc1
      INNER JOIN (
        SELECT tipo_documento, MAX(id_documento) AS ultimo_id
        FROM documentacion_comercio
        WHERE id_comercio = ?
        GROUP BY tipo_documento
      ) dc2 ON dc1.id_documento = dc2.ultimo_id
      ORDER BY dc1.tipo_documento ASC
    `, [id_comercio]);

        // === Traer anexos asociados (si existen) ===
        const [anexosRows] = await pool.query(
            `SELECT anexo1, anexo2, anexo3, anexo4, anexo5
             FROM comercio_anexo
             WHERE id_comercio = ?`,
            [id_comercio]
        );

        let anexos = [];
        if (anexosRows.length > 0) {
            const a = anexosRows[0];
            anexos = [a.anexo1, a.anexo2, a.anexo3, a.anexo4, a.anexo5]
                .filter(v => v && v.trim() !== '');
        }
        console.log('🧩 Anexos consultados:', anexosRows, anexos);

        // 🟢 Si hay titular ambulante, sobreescribimos y marcamos tipo
        if (titularAmbulante) {
            comercio.nombre_titular = titularAmbulante.nombre;
            comercio.apellido_titular = titularAmbulante.apellido;
            comercio.dni_titular = titularAmbulante.dni;
            comercio.telefono_titular = titularAmbulante.telefono;
            comercio.correo_titular = titularAmbulante.correo_electronico;
            comercio.persona_fisica = 1; // para que el frontend lo trate como persona física
            comercio.tipo = 'ambulante'; // 🔧 fijo, sin depender de columnas inexistentes
        }

        return res.json({
            ...comercio,
            documentacion: docs || [],
            anexos,
            nombre_completo_titular: comercio.nombre_titular,
            dni_titular: comercio.dni_titular,
            // 👇 Agregamos explícitamente los alias de representante
            nombre_representante: comercio.persona_fisica === 0
                ? comercio.nombre_titular
                : null,
            apellido_representante: comercio.persona_fisica === 0
                ? comercio.apellido_titular
                : null,
            dni_representante: comercio.persona_fisica === 0
                ? comercio.dni_titular
                : null
        });

    } catch (error) {
        console.error('Error en obtenerComercioPorId:', error);
        return res.status(500).json({ error: 'Error al obtener comercio' });
    }
};

// ==============================
// ♻️ Actualizar renovación de comercio (réplica del flujo de transporte)
// ==============================
exports.actualizarRenovacionComercio = async (req, res) => {
    console.log("BODY RECIBIDO:", req.body);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const {
            id_comercio,
            direccion,
            geolocalizacion,
            telefono_comercio,
            correo_electronico,
            metros_cuadrados,
            monto_sellado_inspeccion
        } = req.body;

        const id_empleado_registro = req.usuario?.id_empleado || null;

        // Traer datos actuales del comercio (número de renovación y categoría)
        const [[existe]] = await conn.query(
            "SELECT numero_renovacion, categoria FROM comercio WHERE id_comercio = ?",
            [id_comercio]
        );
        if (!existe) {
            await conn.rollback();
            return res.status(404).json({ message: "Comercio no encontrado." });
        }

        const numeroRenovacionActual = Number(existe.numero_renovacion || 0);
        const nuevoNumeroRenovacion = numeroRenovacionActual + 1;

        // Fecha de habilitación y vencimiento
        const fechaHabilitacion = new Date();
        const fechaVencimiento = new Date(fechaHabilitacion);

        const categoria = (existe.categoria || "").toLowerCase();
        // comercio general / bares / food truck → 1 año, ambulante → 1 mes
        if (categoria.includes("ambulante")) {
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
        } else {
            fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
        }

        // Actualización principal
        await conn.query(`
            UPDATE comercio SET
                direccion = ?, 
                geolocalizacion = ?, 
                telefono = ?, 
                correo_electronico = ?, 
                metros_cuadrados = ?, 
                monto_sellado_inspeccion = ?, 
                estado_pago_final = 1,
                fecha_habilitacion = ?, 
                fecha_vencimiento = ?, 
                numero_renovacion = ?, 
                id_empleado_registro = ?
            WHERE id_comercio = ?
        `, [
            direccion || null,
            geolocalizacion || null,
            telefono_comercio || null,
            correo_electronico || null,
            metros_cuadrados || null,
            monto_sellado_inspeccion || 0,
            fechaHabilitacion,
            fechaVencimiento,
            nuevoNumeroRenovacion,
            id_empleado_registro,
            id_comercio
        ]);

        // === DOCUMENTACIÓN (idéntica a transporte, adaptada a comercio) ===
        if (req.files && Object.keys(req.files).length > 0) {
            const carpetaDestino = path.join("uploads", "documentos_comercio");
            fs.mkdirSync(carpetaDestino, { recursive: true });

            for (const tipoDoc in req.files) {
                const archivo = req.files[tipoDoc][0];
                const extension = path.extname(archivo.originalname).toLowerCase();
                const nuevoNombre = `${tipoDoc}_${id_comercio}_R${nuevoNumeroRenovacion}${extension}`;
                const rutaDestino = path.join(carpetaDestino, nuevoNombre);

                try {
                    if (archivo?.path && fs.existsSync(archivo.path)) {
                        fs.renameSync(archivo.path, rutaDestino);
                    } else {
                        console.warn(`⚠️ Archivo temporal no encontrado: ${archivo?.path}`);
                        continue;
                    }

                    const rutaPublica = rutaDestino.replace(/\\/g, "/");
                    await conn.query(
                        `INSERT INTO documentacion_comercio (id_comercio, tipo_documento, ruta_archivo)
                         VALUES (?, ?, ?)`,
                        [id_comercio, tipoDoc, rutaPublica]
                    );
                } catch (error) {
                    console.error(`❌ Error moviendo ${tipoDoc}:`, error);
                }
            }
        }

        // === GUARDADO DE ANEXOS (réplica exacta del alta) ===
        if (req.body.anexos) {
            let anexosArray = [];

            try {
                anexosArray = JSON.parse(req.body.anexos);
            } catch (err) {
                anexosArray = Array.isArray(req.body.anexos)
                    ? req.body.anexos
                    : [];
            }

            const [existeAnexo] = await conn.query(
                `SELECT id_comercio FROM comercio_anexo WHERE id_comercio = ?`,
                [id_comercio]
            );

            const a1 = anexosArray[0] || null;
            const a2 = anexosArray[1] || null;
            const a3 = anexosArray[2] || null;
            const a4 = anexosArray[3] || null;
            const a5 = anexosArray[4] || null;

            if (existeAnexo.length > 0) {
                await conn.query(
                    `UPDATE comercio_anexo SET 
                anexo1 = ?, 
                anexo2 = ?, 
                anexo3 = ?, 
                anexo4 = ?, 
                anexo5 = ?
             WHERE id_comercio = ?`,
                    [a1, a2, a3, a4, a5, id_comercio]
                );
            } else {
                await conn.query(
                    `INSERT INTO comercio_anexo 
                (id_comercio, anexo1, anexo2, anexo3, anexo4, anexo5)
             VALUES (?, ?, ?, ?, ?, ?)`,
                    [id_comercio, a1, a2, a3, a4, a5]
                );
            }
        }

        await conn.commit();

        return res.json({
            success: true,
            message: "Renovación de comercio actualizada correctamente.",
            numero_renovacion: nuevoNumeroRenovacion,
            fecha_habilitacion: fechaHabilitacion,
            fecha_vencimiento: fechaVencimiento
        });

    } catch (error) {
        await conn.rollback();
        console.error("Error al actualizar renovación de comercio:", error);
        return res.status(500).json({
            message: "Error al actualizar renovación de comercio.",
            error: error.message
        });
    } finally {
        conn.release();
    }
};