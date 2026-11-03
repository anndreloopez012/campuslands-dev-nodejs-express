const express = require('express');

const app = express();
const pilots = [
  { name: 'Ada', ship: { name: 'Orion', model: 'Scout-1' } },
  { name: 'Sol', ship: { name: 'Vega', model: 'Falcon' } }
];
app.get('/pilots', (_req, res) => res.json(pilots));

app.listen(3000, () => console.log('API espacial en http://localhost:3000'));
