import { randomUUID } from 'node:crypto';

// Middleware de Request ID y Correlación de Solicitudes
export const requestIdMiddleware = (req, res, next) => {
  // Reutiliza el ID provisto por un API Gateway o balanceador, o genera uno nuevo
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId && typeof incomingId === 'string' ? incomingId : randomUUID();

  // Se asigna al objeto req para trazabilidad en capas internas
  req.id = requestId;

  // Se expone en las cabeceras HTTP de respuesta
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  console.log(`[REQ ${requestId}] --> ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQ ${requestId}] <-- ${res.statusCode} (${duration}ms)`);
  });

  next();
};
