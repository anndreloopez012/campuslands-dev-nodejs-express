const VALID_TOKENS = ['token-bibliotecario-secreto', 'token-admin-2026'];

export const mockAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ ok: false, message: 'Cabecera Authorization no provista (401 Unauthorized).' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ ok: false, message: 'Formato de token inválido. Use "Bearer <token>".' });
  }

  const token = parts[1];
  if (!VALID_TOKENS.includes(token)) {
    return res.status(403).json({ ok: false, message: 'Token no autorizado o expirado (403 Forbidden).' });
  }

  req.user = { role: 'Bibliotecario Autorizado', token };
  next();
};
