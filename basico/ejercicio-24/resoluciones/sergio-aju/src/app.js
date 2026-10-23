import express from 'express';
import formulasRoutes from './routes/formulas.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'CRUD basico'
  });
});

app.use('/formulas', formulasRoutes);

export default app;