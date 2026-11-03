import express from 'express';
import tatuajesRoutes from './routes/tatuajes.routes.js';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'req.params y req.query'
  });
});

app.use('/tatuajes', tatuajesRoutes);

export default app;