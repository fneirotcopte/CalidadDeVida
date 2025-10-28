function autorizarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!Array.isArray(rolesPermitidos)) {
      rolesPermitidos = [rolesPermitidos];
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Rol no autorizado.' });
    }

    next();
  };
}

module.exports = autorizarRol;