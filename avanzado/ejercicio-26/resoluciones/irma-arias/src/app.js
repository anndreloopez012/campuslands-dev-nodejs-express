const express = require('express');
const app = express();
const createPlayer = (id, name) => ({ id, name, rank: 'bronce' });
app.get('/players/fixture', (req, res) => res.json([createPlayer(1, 'Nova'), createPlayer(2, 'Fenix')]));
app.listen(process.env.PORT || 3000);
