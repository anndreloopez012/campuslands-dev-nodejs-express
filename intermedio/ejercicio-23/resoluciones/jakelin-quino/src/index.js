const express = require('express');
const { weldArea } = require('./weld');

const app = express();
app.get('/weld/:width/:length', (req, res) => {
  const area = weldArea(Number(req.params.width), Number(req.params.length));
  res.json({ area });
});
app.listen(3000, () => console.log('API de soldadura en http://localhost:3000'));
