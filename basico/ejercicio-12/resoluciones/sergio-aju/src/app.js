import express from 'express';
import peliculasRoutes from './routes/peliculas.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'async await'
  });
});

app.use('/peliculas', peliculasRoutes);

export default app;