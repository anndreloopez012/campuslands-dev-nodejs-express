const express = require('express');
const { listPlayers } = require('./players');

const app = express();
const repository = { findAll: () => [{ name: 'Nova', game: 'Arena Strike' }] };
app.get('/players', (_req, res) => res.json(listPlayers(repository)));
app.listen(3000, () => console.log('API shooter en http://localhost:3000'));
