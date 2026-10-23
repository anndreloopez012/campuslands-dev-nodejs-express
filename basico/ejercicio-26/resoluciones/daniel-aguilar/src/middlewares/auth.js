// SOLO DEMOSTRATIVO: autenticar con cabeceras fijas no es seguro. Sirve para practicar 401 vs 403.
const getApiKey = () => process.env.API_KEY || 'shooter-secret';

// 401 Unauthorized: no sabemos quien eres (falta credencial o es incorrecta).
function requireApiKey(req, res, next) {
  if (req.headers['x-api-key'] !== getApiKey()) {
    res.set('WWW-Authenticate', 'ApiKey');
    return res.status(401).json({ ok: false, message: 'Falta una API key valida (cabecera x-api-key)' });
  }
  next();
}

// 403 Forbidden: sabemos quien eres, pero no tienes permiso.
function requireAdmin(req, res, next) {
  if (req.headers['x-role'] !== 'admin') {
    return res.status(403).json({ ok: false, message: 'Se requiere rol admin (cabecera x-role: admin)' });
  }
  next();
}

module.exports = { requireApiKey, requireAdmin };
