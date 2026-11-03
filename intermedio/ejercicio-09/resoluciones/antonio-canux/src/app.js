import express from 'express';
import fightersRoutes from './routes/fighters.routes.js';

const app = express();

app.use(express.json());

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-09', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "paginacion y filtros"
  });
});

app.use('/api/fighters', fightersRoutes);

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
