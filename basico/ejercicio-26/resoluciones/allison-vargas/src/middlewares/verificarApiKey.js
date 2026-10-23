const API_KEY_VALIDA = 'shooter-secret-key';

export function verificarApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      ok: false,
      message: 'Falta el header x-api-key',
    });
  }

  if (apiKey !== API_KEY_VALIDA) {
    return res.status(401).json({
      ok: false,
      message: 'x-api-key invalida',
    });
  }

  next();
}
