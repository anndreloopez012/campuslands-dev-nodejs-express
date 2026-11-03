const express = require('express');

const app = express();
const teams = [{ id: 1, name: 'Campus FC' }];
app.use(express.json());

app.get('/teams', (_req, res) => res.json(teams));
app.post('/teams', (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'Falta el nombre' });
  const team = { id: teams.length + 1, name: req.body.name };
  teams.push(team);
  res.status(201).json(team);
});

app.listen(3000, () => console.log('API de equipos en http://localhost:3000'));
