import express from 'express';
import soldadoresRoutes from './routes/soldadores.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'datos en memoria'
  });
});

app.use('/soldadores', soldadoresRoutes);

export default app;