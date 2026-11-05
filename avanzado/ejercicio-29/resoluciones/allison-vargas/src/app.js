import express from 'express';

const fixtures = Object.freeze([
  Object.freeze({ id: 'fixture-001', home: 'Tigres', away: 'Halcones', competition: 'Liga Nacional', startsAt: '2026-11-10T18:00:00.000Z' }),
  Object.freeze({ id: 'fixture-002', home: 'Aurora', away: 'Deportivo Central', competition: 'Copa Sala', startsAt: '2026-11-11T20:00:00.000Z' })
]);

export function createApp({ isReady = () => true } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.get('/health/live', (request, response) => response.status(200).json({ status: 'live' }));
  app.get('/health/ready', (request, response) => {
    const ready = isReady();
    return response.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready' });
  });
  app.get('/api/fixtures', (request, response) => response.json({ data: fixtures }));
  app.use((request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, request, response, next) => response.status(error.status || 500).json({ error: error.status ? error.message : 'Error interno del servidor' }));
  return app;
}
