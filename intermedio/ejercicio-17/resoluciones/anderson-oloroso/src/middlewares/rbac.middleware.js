export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole) {
      return res.status(401).json({ ok: false, message: 'Rol de usuario no provisto en cabecera "x-user-role" (401 Unauthorized).' });
    }

    if (!allowedRoles.includes(userRole.toLowerCase())) {
      return res.status(403).json({
        ok: false,
        message: `Acceso restringido. Tu rol [${userRole}] no tiene los permisos suficientes. Roles autorizados: [${allowedRoles.join(', ')}]`
      });
    }

    req.user = { role: userRole.toLowerCase() };
    next();
  };
};
