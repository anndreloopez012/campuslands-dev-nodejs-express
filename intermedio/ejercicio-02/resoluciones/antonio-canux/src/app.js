import express from 'express';
import apiRouter from './routes/index.js';

const app = express();

app.use(express.json());

app.get('/intermedio/ejercicio-02', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "routers modulares"
  });
});

app.use('/api', apiRouter);

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Recurso no encontrado"
  });
});

export default app;
