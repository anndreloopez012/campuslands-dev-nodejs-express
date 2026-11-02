import express from 'express';
import workordersRoutes from './routes/workorders.routes.js';
import authRoutes from './routes/auth.routes.js';
import { requestId } from './middlewares/request-id.middleware.js';

const app = express();

app.use(express.json());
app.use(requestId);
app.use('/api/auth', authRoutes);

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-30', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "proyecto integrador intermedio"
  });
});

app.use('/api/workorders', workordersRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({
    ok: false,
    message: status === 500 ? "Error interno del servidor" : err.message
  });
});

export default app;
