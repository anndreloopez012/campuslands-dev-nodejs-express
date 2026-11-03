const express = require('express');

const app = express();
const matches = [{ id: 1, map: 'Valley' }];
app.use(express.json());
app.get('/matches', (_req, res) => res.json(matches));
app.post('/matches', (req, res) => {
  if (!req.body?.map) return res.status(400).json({ error: 'Falta el mapa' });
  const match = { id: matches.length + 1, map: req.body.map };
  matches.push(match);
  res.status(201).json(match);
});

app.listen(3000, () => console.log('API battle royale en http://localhost:3000'));
