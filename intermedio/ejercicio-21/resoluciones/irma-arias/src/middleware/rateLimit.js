const requestsByIp = new Map();
const windowMs = 60_000;
const maxRequests = 4;

export function rateLimit(request, response, next) {
  const now = Date.now();
  const record = requestsByIp.get(request.ip);
  if (!record || now - record.startedAt >= windowMs) {
    requestsByIp.set(request.ip, { startedAt: now, count: 1 });
    return next();
  }
  if (record.count >= maxRequests) return response.status(429).json({ error: 'Límite de solicitudes alcanzado.' });
  record.count += 1;
  return next();
}
