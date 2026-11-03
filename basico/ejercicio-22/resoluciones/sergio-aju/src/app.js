import express from 'express';
import modelosRoutes from './routes/modelos.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios simples'
  });
});

app.use('/modelos', modelosRoutes);

export default app;