const express = require('express');

const app = express();
const players = express.Router();
app.use(express.json());

players.get('/', (_req, res) => res.json([{ name: 'Nova', rank: 'Oro' }]));
players.post('/', (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'Falta el nombre' });
  res.status(201).json({ name: req.body.name, rank: 'Sin clasificar' });
});

app.use('/players', players);
app.listen(3000, () => console.log('API en http://localhost:3000'));
