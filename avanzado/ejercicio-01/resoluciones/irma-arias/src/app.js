const express = require('express');
const app = express();
app.get('/api/v1/heroes', (req, res) => res.json({ version: 1, heroes: ['Ayla', 'Drako'] }));
app.listen(process.env.PORT || 3000, () => console.log('API RPG lista'));
