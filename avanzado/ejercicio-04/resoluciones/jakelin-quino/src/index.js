const express = require('express');

const app = express();
app.use(express.json());
app.post('/matches/:id/score', (req, res) => {
  if (!Number.isInteger(Number(req.params.id)) || Number(req.params.id) < 1) {
    return res.status(400).json({ error: 'El identificador de partida no es válido' });
  }
  if (!Number.isFinite(req.body?.points) || req.body.points <= 0) {
    return res.status(400).json({ error: 'El puntaje debe ser mayor que cero' });
  }
  res.status(201).json({ matchId: Number(req.params.id), points: req.body.points, status: 'saved' });
});
app.listen(3000, () => console.log('Battle Royale API en http://localhost:3000'));
