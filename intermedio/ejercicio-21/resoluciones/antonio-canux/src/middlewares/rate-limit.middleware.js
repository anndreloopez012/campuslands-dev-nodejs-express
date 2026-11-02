// Ventana fija en memoria: máximo "max" peticiones por IP cada "windowMs"
export const rateLimit = ({ max = 5, windowMs = 10000 } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let entry = hits.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count++;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ ok: false, message: "Demasiadas peticiones. Intenta en " + retryAfter + " segundos" });
    }
    next();
  };
};
