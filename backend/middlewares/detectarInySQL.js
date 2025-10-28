const fs = require('fs');
const path = require('path');

// Asegurar que la carpeta exista: /logs/detectarinyeccionsql
const logDir = path.join(__dirname, '../logs/detectarinyeccionsql');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log por fecha
const today = new Date().toISOString().split('T')[0];
const logPath = path.join(logDir, `inyeccion-${today}.log`);

function detectarInyeccionSQL(req, res, next) {
  const sospechosos = [];
  const parametros = { ...req.query, ...req.body };

  for (const [param, value] of Object.entries(parametros)) {
    if (typeof value === 'string' && /(SELECT|INSERT|DELETE|UPDATE|DROP)/i.test(value)) {
      const mensaje = `${new Date().toISOString()} - ${param} contiene SQL sospechoso: ${value}\n`;
      sospechosos.push(mensaje);
      fs.appendFileSync(logPath, mensaje);
    }
  }

  if (sospechosos.length > 0) {
    console.warn('🚨 Inyección SQL detectada:', sospechosos);
    // return res.status(400).json({ error: 'Parámetros sospechosos detectados' });
  }

  next();
}

module.exports = detectarInyeccionSQL;