import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'modulos ES Modules'
  });
});

export default app;