const express = require('express');
const app = express();
app.use(express.json());
app.post('/matches', (req, res) => {
  const { homeScore, awayScore } = req.body || {};
  if (![homeScore, awayScore].every(Number.isInteger) || homeScore < 0 || awayScore < 0) return res.status(422).json({ error: 'Marcador no valido' });
  res.status(201).json({ homeScore, awayScore });
});
app.listen(process.env.PORT || 3000);
