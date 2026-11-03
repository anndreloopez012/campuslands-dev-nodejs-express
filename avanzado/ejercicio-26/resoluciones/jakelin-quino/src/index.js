const express = require('express');
const { createPlayer } = require('./factory');

const app = express();
const players = [createPlayer('Nova', 'Gold'), createPlayer('Rex', 'Silver')];
app.use(express.json());
app.get('/players', (_req, res) => res.json(players));
app.post('/players', (req, res) => {
  if (typeof req.body?.name !== 'string' || !req.body.name.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  const player = createPlayer(req.body.name.trim());
  players.push(player);
  res.status(201).json(player);
});
app.listen(3000, () => console.log('Shooter API en http://localhost:3000'));
