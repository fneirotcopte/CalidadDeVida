const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const verificarToken = require('./middlewares/verificarToken');
const detectarInyeccionSQL = require('./middlewares/detectarInySQL');

dotenv.config();

const app = express(); 
app.use(cors()); 

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
// Middleware para servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.urlencoded({ extended: true }));
// ✅ Servir correctamente los archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Evitar 401 en favicon para todas las páginas (sin afectar autenticación)
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(detectarInyeccionSQL);

app.get('/test', (req, res) => {
  res.send('Ruta accesible');
});

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

// Importar y usar rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Alta comercio
const altaComercioRoutes = require('./routes/altaComercioRoutes');
app.use('/api/alta-comercio', altaComercioRoutes);

// Alta transporte
const altaTransporteRoutes = require('./routes/altaTransporteRoutes');
app.use('/api/alta-transporte', altaTransporteRoutes);

// Registro comercio
const comercioRoutes = require('./routes/comercioRoutes');
app.use('/', comercioRoutes);
app.use('/api/comercios', comercioRoutes);

// procedimiento
const procedimientoRoutes = require('./routes/procedimientoRoutes');
app.use('/api/procedimientos', procedimientoRoutes);

// registro titular
const titularRoutes = require('./routes/titularRoutes');
app.use('/api/titular', titularRoutes);

// nueva ruta para listar titulares unificados (razon_social + titular_ambulante)
const titularesRoutes = require('./routes/titularesRoutes');
app.use('/api/titulares-unificados', titularesRoutes);

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});





const renovacionTransporteRoutes = require('./routes/renovacionTransporteRoutes');
app.use('/api/renovacion-transporte', renovacionTransporteRoutes);
