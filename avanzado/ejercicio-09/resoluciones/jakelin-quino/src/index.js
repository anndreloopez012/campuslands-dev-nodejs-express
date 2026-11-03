const express = require('express');
const { Readable } = require('node:stream');

const app = express();
app.get('/sessions.txt', (_req, res) => {
  res.type('text/plain');
  Readable.from(['Sesiones de entrenamiento\n', 'Lunes: técnica\n', 'Miércoles: resistencia\n']).pipe(res);
});
app.listen(3000, () => console.log('Kickboxing API en http://localhost:3000'));
