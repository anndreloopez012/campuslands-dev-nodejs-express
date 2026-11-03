const express = require('express');

const app = express();
const documentation = {
  openapi: '3.0.0',
  info: { title: 'API de fórmulas', version: '1.0.0' },
  paths: {
    '/formulas/{formula}': {
      get: {
        summary: 'Calcula una fórmula química',
        responses: { 200: { description: 'Masa calculada' }, 400: { description: 'Fórmula inválida' } }
      }
    }
  }
};
const masses = { H: 1.008, O: 15.999 };
app.get('/openapi.json', (_req, res) => res.json(documentation));
app.get('/formulas/:formula', (req, res) => {
  const parts = req.params.formula.match(/[A-Z][a-z]?\d*/g) || [];
  if (!parts.length || parts.join('') !== req.params.formula) {
    return res.status(400).json({ error: 'Fórmula no válida' });
  }
  let mass = 0;
  for (const part of parts) {
    const [, element, count] = part.match(/^([A-Z][a-z]?)(\d*)$/);
    if (!masses[element]) return res.status(400).json({ error: `Elemento no admitido: ${element}` });
    mass += masses[element] * Number(count || 1);
  }
  res.json({ formula: req.params.formula, molarMass: Number(mass.toFixed(3)) });
});
module.exports = app;
