const express = require('express');

const app = express();
app.get('/api/v1/heroes', (_req, res) => res.json([{ name: 'Ayla', class: 'mage' }]));
app.listen(3000, () => console.log('RPG API en http://localhost:3000'));
