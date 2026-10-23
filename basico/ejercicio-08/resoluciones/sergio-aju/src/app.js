import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'variables de entorno'
  });
});

app.get('/car', (req, res) => {
  res.json({
    name: process.env.CAR_NAME
  });
});

export default app;