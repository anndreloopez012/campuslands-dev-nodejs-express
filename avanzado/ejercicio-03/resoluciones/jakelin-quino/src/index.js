const express = require('express');

const app = express();
app.use(express.json());

const validTeam = (team) =>
  typeof team?.name === 'string' && team.name.trim().length > 0 &&
  Number.isInteger(team.players) && team.players > 0 && team.players <= 5;

app.post('/teams', (req, res) => {
  if (!validTeam(req.body)) {
    return res.status(400).json({ error: 'Envía un nombre y entre 1 y 5 jugadores' });
  }
  res.status(201).json({ name: req.body.name.trim(), players: req.body.players });
});
app.listen(3000, () => console.log('MOBA API en http://localhost:3000'));
