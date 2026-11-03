const express = require('express');

const app = express();
const heroes = [{ id: 1, name: 'Rook', class: 'warrior' }];
app.use(express.json());
app.get('/heroes', (_req, res) => res.json(heroes));
app.post('/heroes', (req, res) => {
  if (!req.body?.name || !req.body?.class) {
    return res.status(400).json({ error: 'Envía nombre y clase' });
  }
  const hero = { id: heroes.length + 1, name: req.body.name, class: req.body.class };
  heroes.push(hero);
  res.status(201).json(hero);
});

module.exports = app;
