import express from 'express';
import championsRoutes from './routes/champions.routes.js';
import docsRoutes from './routes/docs.routes.js';

const app = express();

app.use(express.json());
app.use('/api/docs', docsRoutes);

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-27', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "documentacion de endpoints"
  });
});

app.use('/api/champions', championsRoutes);

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
