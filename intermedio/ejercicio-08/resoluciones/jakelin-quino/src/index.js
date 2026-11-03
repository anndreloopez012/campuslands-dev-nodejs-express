const express = require('express');
const { randomUUID } = require('node:crypto');

const app = express();
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});
app.get('/cars', (req, res) => res.json({ requestId: req.requestId, cars: ['Veloce'] }));

app.listen(3000, () => console.log('API en http://localhost:3000'));
