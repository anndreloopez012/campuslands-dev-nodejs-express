import express from 'express';

export const app = express();
app.use(express.json());

app.get('/intermedio/ejercicio-25', (_req, res) => {
  return res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing de rutas' });
});

app.get('/api/rpg/dungeons', (_req, res) => {
  return res.status(200).json({
    ok: true,
    total: 2,
    data: [
      { id: 1, nombre: 'Cueva de los Trasgos', nivelRecomendado: 5, dificultad: 'Baja' },
      { id: 2, nombre: 'Fortaleza del Dragón Negro', nivelRecomendado: 45, dificultad: 'Legendaria' }
    ]
  });
});

app.post('/api/rpg/dungeons', (req, res) => {
  const { nombre, nivelRecomendado } = req.body;
  if (!nombre || !nivelRecomendado) {
    return res.status(400).json({ ok: false, message: 'nombre y nivelRecomendado son obligatorios.' });
  }
  return res.status(201).json({
    ok: true,
    message: 'Mazmorra creada exitosamente',
    data: { id: 3, nombre, nivelRecomendado: Number(nivelRecomendado) }
  });
});

const PORT = process.env.PORT || 3000;
if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => console.log(`[RPG ROUTE TEST SERVER] http://localhost:${PORT}`));
}
