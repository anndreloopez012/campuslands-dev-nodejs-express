const express = require('express');
const { EventEmitter } = require('node:events');

const app = express();
const events = new EventEmitter();
const notifications = [];
app.use(express.json());
events.on('car:created', (model) => notifications.push(`Vehículo registrado: ${model}`));
app.post('/cars', (req, res) => {
  if (typeof req.body?.model !== 'string' || !req.body.model.trim()) {
    return res.status(400).json({ error: 'El modelo es obligatorio' });
  }
  const model = req.body.model.trim();
  events.emit('car:created', model);
  res.status(201).json({ model, message: 'Vehículo registrado' });
});
app.get('/notifications', (_req, res) => res.json(notifications));
app.listen(3000, () => console.log('Autos API en http://localhost:3000'));
