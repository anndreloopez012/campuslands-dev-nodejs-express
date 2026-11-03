import express from 'express';
import ropaRoutes from './routes/ropa.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'primer servidor Express'
  });
});

app.use('/ropa', ropaRoutes);

export default app;