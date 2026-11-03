const express = require('express');
const app = express();
let rendering = false;
app.post('/renders', (req, res) => {
  if (rendering) return res.status(409).json({ error: 'Ya hay una renderizacion activa' });
  rendering = true;
  setTimeout(() => { rendering = false; }, 1000);
  res.status(202).json({ status: 'en cola' });
});
app.listen(process.env.PORT || 3000);
