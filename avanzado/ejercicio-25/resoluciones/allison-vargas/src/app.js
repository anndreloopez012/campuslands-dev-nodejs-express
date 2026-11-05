import express from 'express';
import { createMissionRouter } from './routes/missions.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (request, response) => response.json({ status: 'ok' }));
  app.use('/api/missions', createMissionRouter());
  app.use((request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ error: 'El cuerpo JSON no es válido' });
    }
    return response.status(500).json({ error: 'Error interno del servidor' });
  });
  return app;
}
