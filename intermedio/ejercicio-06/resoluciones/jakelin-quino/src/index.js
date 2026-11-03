const express = require('express');

const app = express();
app.use(express.json());
const validateMoto = (req, res, next) => {
  if (!req.body?.model || !Number.isInteger(req.body.year) || req.body.year < 1900) {
    return res.status(400).json({ error: 'Modelo y año válido son obligatorios' });
  }
  next();
};

app.post('/motos', validateMoto, (req, res) => res.status(201).json(req.body));
app.listen(3000, () => console.log('API de motos en http://localhost:3000'));
