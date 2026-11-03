import express from 'express';
import animacionesRoutes from './routes/animaciones.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'estructura src routes controllers'
  });
});

app.use('/animaciones', animacionesRoutes);

export default app;