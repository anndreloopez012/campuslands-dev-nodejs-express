const express = require('express');
const { molarMass } = require('./formula');

const app = express();
app.get('/formulas/:formula', (req, res) => {
  res.json({ formula: req.params.formula, molarMass: molarMass(req.params.formula) });
});
app.use((error, _req, res, next) => {
  if (error.statusCode === 400) return res.status(400).json({ error: error.message });
  next(error);
});
app.listen(3000, () => console.log('API de fórmulas en http://localhost:3000'));
