import { randomUUID } from 'node:crypto';

// Asigna un id único a cada petición (o reutiliza el que envía el cliente)
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  console.log('[' + req.id + '] ' + req.method + ' ' + req.originalUrl);
  next();
};
