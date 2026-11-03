const express = require('express');

const app = express();
app.get('/jumps', (req, res) => {
  const roles = (req.get('x-roles') || '').split(',').map((role) => role.trim());
  if (!roles.some((role) => ['pilot', 'instructor'].includes(role))) {
    return res.status(403).json({ error: 'Se requiere el rol pilot o instructor' });
  }
  res.json([{ student: 'Alex', status: 'ready' }]);
});
app.listen(3000, () => console.log('Paracaidismo API en http://localhost:3000'));
