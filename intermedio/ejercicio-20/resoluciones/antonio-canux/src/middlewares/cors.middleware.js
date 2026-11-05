// Orígenes permitidos (separados por coma en la variable ALLOWED_ORIGINS)
const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4200').split(',');

export const cors = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  } else if (origin) {
    return res.status(403).json({ ok: false, message: "Origen no permitido por CORS: " + origin });
  }

  // Respuesta a la petición preflight
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};
