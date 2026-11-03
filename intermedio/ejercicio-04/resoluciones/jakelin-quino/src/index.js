const express = require('express');

const app = express();
const getMatchSummary = (kills, placementPoints) => ({
  total: kills * 2 + placementPoints
});

app.get('/match', (_req, res) => res.json(getMatchSummary(4, 10)));
app.listen(3000, () => console.log('API battle royale en http://localhost:3000'));
