import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
});

export default app;
