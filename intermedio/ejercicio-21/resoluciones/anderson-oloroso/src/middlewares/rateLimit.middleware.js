const requestCounts = new Map();

export const rateLimiter = (options = { windowMs: 60000, max: 5 }) => {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    const clientData = requestCounts.get(ip);

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + options.windowMs;
      return next();
    }

    clientData.count++;
    const remaining = Math.max(0, options.max - clientData.count);
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (clientData.count > options.max) {
      return res.status(429).json({
        ok: false,
        status: 429,
        error: 'TooManyRequests',
        message: `Límite de tasa de peticiones superado (${options.max} solicitudes por ventana de ${options.windowMs / 1000}s). Por favor intente más tarde.`
      });
    }

    next();
  };
};
