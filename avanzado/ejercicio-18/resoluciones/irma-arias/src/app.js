const express = require('express');
const app = express();
app.get('/jump', (req, res) => req.get('x-role') === 'instructor'
  ? res.json({ message: 'Salto autorizado' })
  : res.status(403).json({ error: 'Se requiere rol instructor' }));
app.listen(process.env.PORT || 3000);
