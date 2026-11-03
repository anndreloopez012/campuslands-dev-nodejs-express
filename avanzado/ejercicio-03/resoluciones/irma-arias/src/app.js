const express = require('express');
const app = express();
app.use(express.json());
app.post('/teams', (req, res) => {
  const { name, players } = req.body || {};
  if (typeof name !== 'string' || !Array.isArray(players)) return res.status(400).json({ error: 'name y players son obligatorios' });
  res.status(201).json({ name, players });
});
app.listen(process.env.PORT || 3000);
