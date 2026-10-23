import express from 'express';
import destinosRoutes from './routes/destinos.routes.js';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas GET'
  });
});

app.use('/destinos', destinosRoutes);

export default app;