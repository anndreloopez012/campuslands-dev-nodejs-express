const express = require('express');
const { nextServiceKm } = require('./service');

const app = express();
const motos = [{ id: 1, model: 'Racer', km: 1200, nextServiceKm: 6000 }];
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'motorcycle-workshop' }));
app.get('/motos', (_req, res) => res.json(motos));
app.post('/motos', (req, res) => {
  const { model, km } = req.body || {};
  if (typeof model !== 'string' || !model.trim() || !Number.isFinite(km) || km < 0) {
    return res.status(400).json({ error: 'Envía un modelo y kilometraje válido' });
  }
  const moto = { id: motos.length + 1, model: model.trim(), km, nextServiceKm: nextServiceKm(km) };
  motos.push(moto);
  res.status(201).json(moto);
});

module.exports = app;
