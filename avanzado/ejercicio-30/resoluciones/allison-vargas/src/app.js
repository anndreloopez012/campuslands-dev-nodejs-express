import express from 'express';
import { createMotorcycleRouter } from './routes/motorcycles.js';
import { createWorkOrderRouter } from './routes/work-orders.js';
import { createWorkshop } from './services/workshop.js';

export function createApp({ workshop = createWorkshop() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (request, response) => response.json({ status: 'ok' }));
  app.use('/api/motorcycles', createMotorcycleRouter(workshop));
  app.use('/api/work-orders', createWorkOrderRouter(workshop));
  app.use((request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } }));
  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && 'body' in error) return response.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo JSON no es válido' } });
    const status = error.status ?? 500;
    const code = error.code ?? 'INTERNAL_ERROR';
    const message = status === 500 ? 'Error interno del servidor' : error.message;
    return response.status(status).json({ error: { code, message } });
  });
  return app;
}
