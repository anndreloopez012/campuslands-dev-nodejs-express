const express = require('express');
const { EventEmitter } = require('node:events');
const app = express();
const events = new EventEmitter();
app.use(express.json());
events.on('car.created', car => console.log('Auto registrado:', car.model));
app.post('/cars', (req, res) => {
  const model = req.body?.model;
  if (!model) return res.status(400).json({ error: 'Indica el modelo' });
  const car = { model };
  events.emit('car.created', car);
  res.status(201).json(car);
});
app.listen(process.env.PORT || 3000);
