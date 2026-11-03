const express = require('express');

const app = express();
let places = 2;
app.use(express.json());
app.post('/enrollments', (req, res) => {
  if (typeof req.body?.team !== 'string' || !req.body.team.trim()) {
    return res.status(400).json({ error: 'El equipo es obligatorio' });
  }
  if (places === 0) return res.status(409).json({ error: 'No quedan cupos' });
  const enrollment = { team: req.body.team.trim(), place: 3 - places, status: 'confirmed' };
  places -= 1;
  res.status(201).json(enrollment);
});
app.listen(3000, () => console.log('API de torneos en http://localhost:3000'));
