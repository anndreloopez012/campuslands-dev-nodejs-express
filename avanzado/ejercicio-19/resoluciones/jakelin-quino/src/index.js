const express = require('express');

const app = express();
const audit = [];
let nextId = 1;
app.use(express.json());
app.post('/appointments', (req, res) => {
  if (!req.body?.client || !req.body?.design) {
    return res.status(400).json({ error: 'Envía cliente y diseño' });
  }
  const appointment = { id: nextId++, client: req.body.client, design: req.body.design };
  audit.push({ action: 'appointment.created', user: req.get('x-user') || 'guest', at: new Date().toISOString() });
  res.status(201).json(appointment);
});
app.get('/audit', (_req, res) => res.json(audit));
app.listen(3000, () => console.log('Estudio API en http://localhost:3000'));
