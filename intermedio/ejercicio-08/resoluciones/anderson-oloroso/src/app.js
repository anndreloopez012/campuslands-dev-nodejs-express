import express from 'express';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import telemetryRoutes from './routes/telemetry.routes.js';

const app = express();

app.use(express.json());

// Se registra el middleware de Request ID al principio de la cadena
app.use(requestIdMiddleware);

// Rutas de la API
app.use(telemetryRoutes);

export default app;
