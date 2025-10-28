const pool = require('../db');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

// ==============================
// ✅ Registrar Transporte Completo (idéntico a comercio, adaptado)
// ==============================
exports.registrarTransporteCompleto = async (req, res) => {
    try {
        console.log('FILES (transporte):', Object.keys(req.files || {}));

        const {
            id_titular_ambulante,
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
            monto_total,
            numeroVehiculo
        } = req.body;

        console.log('📦 Datos recibidos en registrarTransporteCompleto:', {
            patente,
            typeofPatente: typeof patente,
            body: req.body
        });


        // ✅ Validaciones mínimas (como comercio: validar requeridos del registro)
        if (!id_titular_ambulante || !tipo_vehiculo || !tipo_alimento || !patente) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        // 👉 Normalizaciones numéricas
        const meses = Number.parseInt(meses_adelantados, 10) || 1;
        const montoSellado = Number.parseFloat(monto_sellado) || 0;
        const montoTotal = Number.parseFloat(monto_total) || 0;

        // 👉 Fechas habilitación / vencimiento (idéntico criterio a comercio)
        const fechaHabilitacion = new Date();
        const fechaVencimiento = new Date(fechaHabilitacion);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);

        // 👉 Número de vehículo (idéntico a cómo comercio usa "sucursal")
        let numeroVehiculoDB = Number.parseInt(numeroVehiculo, 10);
        if (!Number.isFinite(numeroVehiculoDB)) {
            // si no vino del frontend, calcular COUNT + 1 (como fallback)
            const [rows] = await pool.query(
                'SELECT COUNT(*) AS total FROM transporte WHERE id_titular_ambulante = ?',
                [id_titular_ambulante]
            );
            numeroVehiculoDB = Number(rows?.[0]?.total || 0) + 1;
        }
console.log('Empleado que registra el transporte:', req.usuario.id_empleado);
        // 1) Insert principal
        const [result] = await pool.query(
            `INSERT INTO transporte (
    id_titular_ambulante, nombre_chofer, dni_chofer, carnet_chofer,
    telefono_chofer, tipo_vehiculo, tipo_alimento, patente,
    vto_fecha, seguro_fecha, monto_sellado, meses_adelantados,
    monto_total, fecha_habilitacion, fecha_vencimiento,
    activo, numero_vehiculo, numero_renovacion, id_empleado_registro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, ?)
  `,
            [
                id_titular_ambulante,
                nombre_chofer || null,
                dni_chofer || null,
                carnet_chofer || null,
                telefono_chofer || null,
                tipo_vehiculo,
                tipo_alimento,
                String(
                    typeof patente === 'object'
                        ? patente?.patente ?? ''
                        : patente ?? ''
                ).trim().toUpperCase(),
                vto_fecha || null,
                seguro_fecha || null,
                montoSellado,
                meses,
                montoTotal,
                fechaHabilitacion,
                fechaVencimiento,
                numeroVehiculoDB,
                req.usuario.id_empleado
            ]
        );

        const idTransporte = result.insertId;

        // 2) Documentación (renombrar con id_transporte) — espejo de comercio
        if (req.files) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'documentos_transporte');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const documentos = [
                { tipo: 'dni_frente', file: req.files['dni_frente']?.[0] },
                { tipo: 'dni_dorso', file: req.files['dni_dorso']?.[0] },
                { tipo: 'carnet_frente', file: req.files['carnet_frente']?.[0] },
                { tipo: 'carnet_dorso', file: req.files['carnet_dorso']?.[0] },
                { tipo: 'cert_salud', file: req.files['cert_salud']?.[0] },
                { tipo: 'foto_vehiculo', file: req.files['foto_vehiculo']?.[0] },
                { tipo: 'cedula_verde', file: req.files['cedula_verde']?.[0] },
                { tipo: 'seguro_vehiculo', file: req.files['seguro_vehiculo']?.[0] },
                { tipo: 'vto_vehiculo', file: req.files['vto_vehiculo']?.[0] },
                { tipo: 'sellado_bromatologico', file: req.files['sellado_bromatologico']?.[0] },

            ];


            for (const doc of documentos.filter(d => d.file)) {
                const ext = path.extname(doc.file.originalname).toLowerCase();
                const newName = `${doc.tipo}_${idTransporte}${ext}`;
                const newPath = path.join(uploadDir, newName);

                fs.renameSync(doc.file.path, newPath);

                const rutaArchivo = newPath.replace(/\\/g, '/');
                await pool.query(
                    `INSERT INTO documentacion_transporte (id_transporte, tipo_documento, ruta_archivo)
           VALUES (?, ?, ?)`,
                    [idTransporte, doc.tipo, rutaArchivo]
                );
            }
        }

        // 3) Generar QR (prefijo transporte_) — igual que comercio pero con tabla/campos de transporte
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const targetUrl = `${baseUrl}/api/alta-transporte/estado/${idTransporte}`;
        const qrDir = path.join(process.cwd(), 'uploads', 'qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        const qrFilename = `transporte_${idTransporte}.png`;
        const qrFilePath = path.join(qrDir, qrFilename);
        await QRCode.toFile(qrFilePath, targetUrl, { width: 600, margin: 1 });

        const qrPublicPath = `/uploads/qr/${qrFilename}`;
        await pool.query('UPDATE transporte SET ruta_qr = ? WHERE id_transporte = ?', [
            qrPublicPath,
            idTransporte
        ]);

        // 4) Respuesta idéntica (comercio devuelve success + id)
        return res.status(201).json({
            success: true,
            idTransporte,
            message: 'Transporte registrado exitosamente',
            qr: qrPublicPath
        });
    } catch (error) {
        console.error('Error en registrarTransporteCompleto:', error);
        return res.status(500).json({
            error: 'Error al registrar transporte',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// ==============================
// ✅ Generar QR manualmente
// ==============================
exports.generarQR = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ ok: false, error: 'ID inválido' });
        }

        const [[transp]] = await pool.query(
            'SELECT id_transporte FROM transporte WHERE id_transporte = ?',
            [id]
        );
        if (!transp) {
            return res.status(404).json({ ok: false, error: 'Transporte no encontrado' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const targetUrl = `${baseUrl}/api/alta-transporte/estado/${id}`;
        const qrDir = path.join(process.cwd(), 'uploads', 'qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        const qrFilename = `transporte_${id}.png`; // ← prefijo agregado también aquí
        const qrFilePath = path.join(qrDir, qrFilename);
        if (!fs.existsSync(qrFilePath)) {
            await QRCode.toFile(qrFilePath, targetUrl, { width: 600, margin: 1 });
        }

        const qrPublicPath = `/uploads/qr/${qrFilename}`;
        await pool.query('UPDATE transporte SET ruta_qr = ? WHERE id_transporte = ?', [
            qrPublicPath,
            id
        ]);

        res.json({ ok: true, id, url: targetUrl, qr_path: qrPublicPath });
    } catch (err) {
        console.error('Error al generar QR:', err);
        res.status(500).json({ ok: false, error: 'Error al generar QR' });
    }
};

// ==============================
// 🚗 Sugerir próximo número de vehículo (idéntico a comercio, adaptado)
// ==============================
exports.vehiculoSiguiente = async (req, res) => {
    try {
        const { titular } = req.query; // id_titular_ambulante
        if (!titular) {
            return res.status(400).json({ error: "Falta el parámetro titular" });
        }

        const [rows] = await pool.query(
            `SELECT COUNT(*) AS total
       FROM transporte
       WHERE id_titular_ambulante = ?`,
            [titular]
        );

        const total = Number(rows[0]?.total ?? 0);
        const proximoVehiculo = total + 1;
        return res.json({ proximoVehiculo });
    } catch (error) {
        console.error("Error en vehiculoSiguiente:", error);
        return res.status(500).json({ error: "Error al calcular próximo vehículo" });
    }
};

// ==============================
// 🚘 Verificar existencia de patente
// ==============================
exports.existePatente = async (req, res) => {
    try {
        const { patente } = req.query;
        if (!patente) {
            return res.status(400).json({ error: 'Falta el parámetro patente.' });
        }

        // Normalizar patente de forma segura
        let patenteNormalizada = '';

        if (typeof patente === 'string') {
            patenteNormalizada = patente.trim().toUpperCase();
        } else if (patente && typeof patente === 'object' && patente.patente) {
            // Si llega como objeto { patente: 'ABC123' }
            patenteNormalizada = String(patente.patente).trim().toUpperCase();
        } else {
            patenteNormalizada = String(patente || '').trim().toUpperCase();
        }

        const [rows] = await pool.query(
            'SELECT id_transporte FROM transporte WHERE patente = ? LIMIT 1',
            [patenteNormalizada]
        );

        if (rows.length > 0) {
            return res.json({ existe: true });
        } else {
            return res.json({ existe: false });
        }
    } catch (error) {
        console.error('Error en existePatente:', error);
        return res.status(500).json({ error: 'Error al verificar la patente.' });
    }
};

