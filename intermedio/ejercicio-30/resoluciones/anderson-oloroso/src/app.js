import express from 'express';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import { globalErrorHandler } from './middlewares/errorHandler.middleware.js';
import workshopRoutes from './routes/workshop.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestIdMiddleware);
app.use(workshopRoutes);
app.use(globalErrorHandler);

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => {
    console.log(`[WORKSHOP MASTER API] Servidor escuchando en http://localhost:${PORT}`);
    console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-30`);
  });
}

export default app;
