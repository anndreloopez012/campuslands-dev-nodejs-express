const express = require('express');

const app = express();
app.get('/reports', (req, res) => {
  if (req.get('x-role') !== 'admin') return res.status(403).json({ error: 'Permiso denegado' });
  res.json([{ destination: 'Antigua', bookings: 12 }]);
});

app.listen(3000, () => console.log('API de viajes en http://localhost:3000'));
